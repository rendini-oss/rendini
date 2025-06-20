import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import { fileURLToPath } from 'url';
import { GraphQLScalarType } from 'graphql';
import type { RenderContextInput, RenderResult, RenderEntry, JSON } from '../types.js';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, the pages are in the root 'pages' directory
// In production (after build), they should be in 'dist/pages'
const PAGES_ROOT = fs.existsSync(path.join(__dirname, '../pages'))
  ? path.join(__dirname, '../pages')
  : path.join(__dirname, '../../pages');

// Define scalar types
export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString(); // Convert outgoing Date to ISO string
    }
    throw Error('DateTime scalar serialization error: expected Date object');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value); // Convert incoming string to Date
    }
    throw new Error('DateTime scalar parse error: invalid input');
  },
  parseLiteral(ast: any): Date {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    throw new Error('DateTime scalar parse error: invalid AST');
  },
});

export const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown): unknown {
    return value; // Pass through, GraphQL.js will validate
  },
  parseValue(value: unknown): unknown {
    return value; // Pass through, GraphQL.js will validate
  },
  parseLiteral(ast: any): unknown {
    // This is a simplified implementation
    if (ast.kind === 'ObjectValue') {
      const result: Record<string, unknown> = {};
      ast.fields.forEach((field: any) => {
        result[field.name.value] = parseLiteralToJs(field.value);
      });
      return result;
    }
    return parseLiteralToJs(ast);
  },
});

// Helper function for JSON parsing
function parseLiteralToJs(ast: any): unknown {
  switch (ast.kind) {
    case 'IntValue':
      return parseInt(ast.value, 10);
    case 'FloatValue':
      return parseFloat(ast.value);
    case 'BooleanValue':
      return ast.value;
    case 'StringValue':
      return ast.value;
    case 'NullValue':
      return null;
    case 'ListValue':
      return ast.values.map(parseLiteralToJs);
    // Add more cases as needed
    default:
      return null;
  }
}

// Get all templates as render entries
function getTemplates(namespace?: string): RenderEntry[] {
  try {
    return fs
      .readdirSync(PAGES_ROOT)
      .filter(file => file.endsWith('.njk'))
      .map(file => {
        const name = file.replace('.njk', '');
        const path = `/${name}`;

        // Only include templates that match the namespace if provided
        if (namespace && !path.startsWith(`/${namespace}`)) {
          return null;
        }

        // Get file stats for lastModified
        const stats = fs.statSync(`${PAGES_ROOT}/${file}`);

        return {
          path,
          lastModified: stats.mtime,
          priority: 1.0,
          changeFrequency: 'weekly',
          params: {},
        };
      })
      .filter(Boolean) as RenderEntry[]; // Filter out null entries
  } catch (error) {
    console.error('Error listing templates:', error);
    return [];
  }
}

export const resolvers = {
  // Scalar resolvers
  JSON: jsonScalar,
  DateTime: dateTimeScalar,

  // Query resolvers
  render: async ({
    path,
    params,
    context,
  }: {
    path: string;
    params?: JSON;
    context?: RenderContextInput;
  }): Promise<RenderResult> => {
    try {
      // Remove leading slash if present
      const templateName = path.startsWith('/') ? path.substring(1) : path;

      // Check if the requested template exists
      const templatePath = `${PAGES_ROOT}/${templateName}.njk`;
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Render the template with the provided data
      const content = nunjucks.render(`${templateName}.njk`, params || {});

      return {
        content,
        contentType: 'text/html',
        metadata: {
          renderedWith: 'nunjucks',
          templateName,
          context,
          params,
        },
      };
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  },

  renderMap: ({ namespace }: { namespace?: string }): RenderEntry[] => {
    return getTemplates(namespace);
  },
};
