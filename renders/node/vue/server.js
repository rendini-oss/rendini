import express from 'express';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './app.js';

const server = express();

// Configure Express to parse JSON bodies
server.use(express.json());

// Health check endpoint for Kubernetes readiness probe
server.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

// API endpoint to list all available render targets (template names)
server.get('/api/render-targets', (req, res) => {
  try {
    res.json([{ name: 'default', description: 'Default render target' }]);
  } catch (error) {
    console.error('Error listing render targets:', error);
    res.status(500).json({ error: 'Failed to list render targets' });
  }
});

server.post('/api/render', (req, res) => {
  try {
    const { name, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (name !== 'default') {
      return res.status(404).json({ error: `Template '${name}' not found` });
    }

    const app = createApp();

    renderToString(app).then(html => {
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
          <script type="module" src="/client.js"></script>
        </head>
        <body>
          <div id="app">${html}</div>
        </body>
      </html>
      `);
    });
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

server.get('/', (req, res) => {
  const app = createApp();

  renderToString(app).then(html => {
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
        <script type="module" src="/client.js"></script>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
    `);
  });
});

server.use(express.static('.'));

server.listen(3000, () => {
  console.log('ready');
});
