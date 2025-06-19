import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import GraphQLJSON from 'graphql-type-json';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, the pages are in the root 'pages' directory
// In production (after build), they should be in 'dist/pages'
const PAGES_ROOT = fs.existsSync(path.join(__dirname, '../pages'))
  ? path.join(__dirname, '../pages')
  : path.join(__dirname, '../../pages');

// Type for template data
interface TemplateData {
  [key: string]: any;
}

// Type for render mutation arguments
interface RenderArgs {
  name: string;
  data?: TemplateData;
}

// Type for render target
interface RenderTarget {
  name: string;
  template: string;
}

// Type for render result
interface RenderResult {
  name: string;
  html: string;
}

function listTemplates(): RenderTarget[] {
  return fs
    .readdirSync(PAGES_ROOT)
    .filter(f => f.endsWith('.njk'))
    .map(f => ({ name: f.replace(/\.njk$/, ''), template: f }));
}

// graphql-http compatible resolvers
const resolvers = {
  // For scalar JSON type
  JSON: GraphQLJSON,

  // Root resolvers
  renderTargets: (): RenderTarget[] => listTemplates(),
  render: ({ name, data }: RenderArgs): RenderResult => {
    const template = `${name}.njk`;
    const html = nunjucks.render(template, data || {});
    return { name, html };
  },
};

export default resolvers;
