// src/server.ts
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';

console.log('Starting Rendini Vue Renderer API...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Directory containing Vue components (views)
const viewsDir = path.join(__dirname, '../../src/views');

// List available Vue components (views)
app.get('/api/render-targets', (req: express.Request, res: express.Response) => {
  try {
    const files = fs
      .readdirSync(viewsDir)
      .filter(f => f.endsWith('.vue'))
      .map(f => ({ name: f.replace(/\.vue$/, ''), template: f }));
    res.json(files);
  } catch (error) {
    console.error('Error listing Vue components:', error);
    res.status(500).json({ error: 'Failed to list Vue components' });
  }
});

// Interface for the render request
interface RenderRequest {
  name: string;
  data?: Record<string, any>;
}

// Render a Vue component to HTML
app.post('/api/render', express.json(), async (req: express.Request, res: express.Response) => {
  try {
    const { name, data } = req.body as RenderRequest;
    if (!name) {
      return res.status(400).json({ error: 'Component name is required' });
    }

    const componentPath = path.join(viewsDir, `${name}.vue`);
    if (!fs.existsSync(componentPath)) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // For demo purposes, return a simplified response
    // In a real implementation, you would:
    // 1. Load the Vue component
    // 2. Create an SSR app instance
    // 3. Render it to HTML
    const html = `<div>Rendered ${name} component with data: ${JSON.stringify(data)}</div>`;
    res.json({ name, html });
  } catch (error) {
    console.error('Error rendering Vue component:', error);
    res.status(500).json({ error: 'Failed to render Vue component' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Rendini Vue Renderer API running at http://localhost:${port}`);
  console.log(`📃 Available components at http://localhost:${port}/api/render-targets`);
});
