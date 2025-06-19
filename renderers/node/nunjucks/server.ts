// server.ts - Express server with Nunjucks templating

// Import required modules
import express from 'express';
import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure Express to parse JSON bodies
app.use(express.json());

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Configure Nunjucks template engine
// In development, the pages are in the root 'pages' directory
// In production (after build), they should be in 'dist/pages'
const templatesPath = fs.existsSync(path.join(__dirname, 'pages'))
  ? path.join(__dirname, 'pages')
  : path.join(__dirname, '../pages');

nunjucks.configure(templatesPath, {
  autoescape: true,
  express: app,
});

// Create pages directory if it doesn't exist
if (!fs.existsSync(templatesPath)) {
  fs.mkdirSync(templatesPath, { recursive: true });
}

// Type for render request body
interface RenderRequest {
  name: string;
  data?: Record<string, any>;
}

// Health check endpoint for Kubernetes readiness probe
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

// API endpoint to list all available render targets (template names)
app.get('/api/render-targets', (req, res) => {
  try {
    // Read all .njk files from the pages directory
    const files = fs
      .readdirSync(templatesPath)
      .filter(file => file.endsWith('.njk'))
      .map(file => file.replace('.njk', ''));

    res.json(files);
  } catch (error) {
    console.error('Error listing render targets:', error);
    res.status(500).json({ error: 'Failed to list render targets' });
  }
});

// API endpoint to render a template with provided data
app.post('/api/render', (req, res) => {
  try {
    const { name, data } = req.body as RenderRequest;

    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    // Check if the requested template exists
    const templatePath = path.join(templatesPath, `${name}.njk`);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: `Template '${name}' not found` });
    }

    // Render the template with the provided data
    const html = nunjucks.render(`${name}.njk`, data || {});

    res.json({ name, html });
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

// Start the server
// Set up GraphQL middleware
const schema = buildSchema(typeDefs);

// Create root value with resolvers
const root = {
  renderTargets: resolvers.renderTargets,
  render: resolvers.render,
};

// Use the graphql-http middleware for handling GraphQL requests
app.use(
  '/graphql',
  createHandler({
    schema,
    rootValue: root,
  })
);

// Serve the static HTML file ./graphiql/index.html
app.get('/graphiql', (req, res) => {
  res.sendFile(path.join(__dirname, 'graphiql', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Rendini server running at http://localhost:${port}`);
  console.log(`📊 GraphQL API available at http://localhost:${port}/graphql`);
  console.log(`🔍 GraphiQL interface at http://localhost:${port}/graphiql`);
});
