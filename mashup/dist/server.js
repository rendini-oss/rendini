// rendini-api/src/server.ts
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, GraphQLScalarType } from 'graphql';
import fetch from 'node-fetch';
// Configurable renderer endpoints
const RENDERS = [
  { name: 'nunjucks', url: process.env.NUNJUCKS_RENDERER_URL || 'http://localhost:3001' },
  { name: 'vue', url: process.env.VUE_RENDERER_URL || 'http://localhost:3002' },
];
// GraphQL schema
const schema = buildSchema(`
  type RenderTarget {
    name: String!
    template: String!
    renderer: String!
  }
  type RenderResult {
    html: String!
  }
  type Query {
    renderTargets: [RenderTarget!]!
  }
  type Mutation {
    render(name: String!, data: JSON, renderer: String!): RenderResult!
  }
  scalar JSON
`);
// JSON scalar implementation
const Kind = {
  STRING: 'StringValue',
  BOOLEAN: 'BooleanValue',
  INT: 'IntValue',
  FLOAT: 'FloatValue',
  OBJECT: 'ObjectValue',
  LIST: 'ListValue',
};
// Helper function to parse literals
function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = {};
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(n => parseLiteral(n));
    default:
      return null;
  }
}
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON',
  parseValue: value => value,
  serialize: value => value,
  parseLiteral,
});
// Helper to aggregate render targets from all renders
async function getAllRenderTargets() {
  const results = await Promise.all(
    RENDERS.map(async renderer => {
      try {
        const res = await fetch(`${renderer.url}/api/render-targets`);
        if (!res.ok) return [];
        const targets = await res.json();
        return targets.map(t => ({ ...t, renderer: renderer.name }));
      } catch (error) {
        console.error(`Error fetching from ${renderer.name}:`, error);
        return [];
      }
    })
  );
  return results.flat();
}
// Helper to proxy render call to the correct renderer
async function renderTemplate(args) {
  const { name, data, renderer } = args;
  const r = RENDERS.find(r => r.name === renderer);
  if (!r) throw new Error(`Renderer not found: ${renderer}`);
  try {
    const res = await fetch(`${r.url}/api/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Render failed (${res.status}): ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error rendering with ${renderer}:`, error);
    throw error;
  }
}
const root = {
  renderTargets: getAllRenderTargets,
  render: renderTemplate,
  JSON: JSONScalar,
};
const app = express();
app.use(express.json());
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: error => {
      console.error('GraphQL error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);
// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rendini API listening on port ${PORT}`);
});
