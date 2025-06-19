import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './app.js';
import type { RenderTarget, RenderRequest, ErrorResponse } from './types.js';

const server = express();

// Configure Express to parse JSON bodies
server.use(express.json());

// Health check endpoint for Kubernetes readiness probe
const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).send('ok');
};
server.get('/healthz', healthCheck);

// API endpoint to list all available render targets (template names)
const listRenderTargets: RequestHandler<{}, RenderTarget[] | ErrorResponse> = (_req, res) => {
  try {
    res.json([{ name: 'default', description: 'Default render target' }]);
  } catch (error) {
    console.error('Error listing render targets:', error);
    res.status(500).json({ error: 'Failed to list render targets' });
  }
};
server.get('/api/render-targets', listRenderTargets);

const handleRender: RequestHandler<{}, string | ErrorResponse, RenderRequest> = async (
  req,
  res
) => {
  try {
    const { name, data } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Template name is required' });
      return;
    }

    if (name !== 'default') {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }

    const app = createApp();
    const html = await renderToString(app);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vue SSR Example</title>
          <script type="importmap">
            {
              "imports": {
                "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
              }
            }
          </script>
          <script type="module" src="/dist/client.js"></script>
        </head>
        <body>
          <div id="app">${html}</div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
};

server.post('/api/render', handleRender);

const handleRoot: RequestHandler = async (_req, res) => {
  try {
    const app = createApp();
    const html = await renderToString(app);

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR Example</title>
        <script type="importmap">
          {
            "imports": {
              "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"              }
            }
          </script>
          <script type="module" src="/dist/client.js"></script>
        </head>
        <body>
          <div id="app">${html}</div>
      </body>
    </html>
    `);
  } catch (error) {
    console.error('Error rendering root:', error);
    res.status(500).send('Internal Server Error');
  }
};

server.get('/', handleRoot);

server.use(express.static('.'));

server.listen(3000, () => {
  console.log('ready');
});
