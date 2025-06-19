// rendini-vue/server.ts
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderToString } from 'vue/server-renderer';
import { createSSRApp } from 'vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Directory containing Vue components (for demo, use src/views)
const viewsDir = path.join(__dirname, 'src', 'views');

// List available Vue components (views)
app.get('/api/render-targets', (req, res) => {
  try {
    const files = fs
      .readdirSync(viewsDir)
      .filter(f => f.endsWith('.vue'))
      .map(f => ({ name: f.replace(/\.vue$/, ''), template: f }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list Vue components' });
  }
});

// Render a Vue component to HTML
app.post('/api/render', async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name) return res.status(400).json({ error: 'Component name is required' });
    const componentPath = path.join(viewsDir, `${name}.vue`);
    if (!fs.existsSync(componentPath))
      return res.status(404).json({ error: 'Component not found' });
    // Dynamically import the component
    const component = (await import(componentPath)).default;
    const appInstance = createSSRApp(component, data || {});
    const html = await renderToString(appInstance);
    res.json({ name, html });
  } catch (error) {
    res.status(500).json({ error: 'Failed to render Vue component', details: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Vue renderer listening on port ${port}`);
});
