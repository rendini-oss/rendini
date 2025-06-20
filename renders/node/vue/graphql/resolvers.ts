import { createApp } from '../app.js';
import { renderToString } from 'vue/server-renderer';
import type { RenderContextInput, RenderResult, RenderEntry, JSON } from '../types.js';
import { GraphQLScalarType } from 'graphql';

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

// Mock data for renderMap
const renderEntries: RenderEntry[] = [
  {
    path: '/default',
    params: {},
    lastModified: new Date(),
    priority: 1.0,
    changeFrequency: 'weekly',
  },
];

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
      if (path !== '/default') {
        throw new Error(`Template '${path}' not found`);
      }

      // Create Vue app
      const app = createApp();
      const html = await renderToString(app);

      // Generate full HTML with client-side hydration
      const content = `
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
      `;

      return {
        content,
        contentType: 'text/html',
        metadata: {
          renderedWith: 'vue',
          context,
          params,
        },
      };
    } catch (error) {
      console.error('Error rendering:', error);
      throw error;
    }
  },

  renderMap: ({ namespace }: { namespace?: string }): RenderEntry[] => {
    // If namespace is provided, filter by namespace
    if (namespace) {
      return renderEntries.filter(entry => entry.path.startsWith(`/${namespace}`));
    }

    return renderEntries;
  },
};
