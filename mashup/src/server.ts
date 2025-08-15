// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema, GraphQLScalarType, ValueNode } from "graphql";
import fetch from "node-fetch";
import { RenderResult } from "./types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface RenderQueryInput {
  paths: string[];
  context?: RenderContextInput;
  namespace?: string;
}

interface RenderContextInput {
  device?: string;
  locale?: string;
  userAgent?: string;
  preview?: boolean;
}

interface SitemapFilter {
  namespace?: string;
  since?: Date;
  includeVariants?: boolean;
}

interface SitemapEntry {
  path: string;
  lastModified: string;
  priority?: number;
  changefreq?: string;
}

interface RenderIndexEntry {
  namespace: string;
  path: string;
  contentType: string;
  lastModified?: Date;
  plugin?: string;
}

interface SitemapOutput {
  xml: string;
  json: SitemapEntry[];
  generatedAt: Date;
  count: number;
}

// Get __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurable rendering endpoints
const RENDERS = [
  { name: "nunjucks", url: process.env.RENDINI_RENDER_NUNJUCKS_URL || "http://localhost:3001" },
  { name: "vue", url: process.env.RENDINI_RENDER_VUE_URL || "http://localhost:3002" },
];

// GraphQL schema
const schema = buildSchema(`
  type Query {
    """
    API version 1
    """
    v1: V1Query
  }

  type V1Query {
    renderAll(query: RenderQueryInput!): [RenderResult!]!
    renderSitemap(filter: SitemapFilter): SitemapOutput!
    renderIndex: [RenderIndexEntry!]!
  }

  input RenderQueryInput {
    paths: [String!]! # Fully resolved paths
    context: RenderContextInput
    namespace: String # Optional filter
  }

  input SitemapFilter {
    namespace: String
    since: DateTime
    includeVariants: Boolean = false
  }

  type SitemapOutput {
    xml: String!
    json: JSON!
    generatedAt: DateTime!
    count: Int!
  }

  type RenderIndexEntry {
    namespace: String!
    path: String!
    contentType: String!
    lastModified: DateTime
    plugin: String
  }

  input RenderContextInput {
    device: String
    locale: String
    userAgent: String
    preview: Boolean
  }

  type RenderResult {
    content: String! # The rendered output (HTML, Markdown, SVG, etc.)
    contentType: String! # MIME type of rendered content
    metadata: JSON # Optional metadata returned by the source
  }

  scalar JSON
  scalar DateTime
`);

// JSON scalar implementation
const Kind = {
  STRING: "StringValue",
  BOOLEAN: "BooleanValue",
  INT: "IntValue",
  FLOAT: "FloatValue",
  OBJECT: "ObjectValue",
  LIST: "ListValue",
};

// Helper function to parse literals
function parseLiteral(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value: any = {};
      ast.fields.forEach((field: any) => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map((n: any) => parseLiteral(n));
    default:
      return null;
  }
}

/**
 * JSON scalar implementation for GraphQL
 */
const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON",
  parseValue: (value: any) => value,
  serialize: (value: any) => value,
  parseLiteral,
});

/**
 * DateTime scalar implementation for GraphQL
 */
const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime custom scalar type",
  parseValue(value: string | number): Date {
    return new Date(value);
  },
  serialize(value: Date | string | number): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  },
  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === "StringValue") {
      return new Date(ast.value);
    }
    return null;
  },
});

/**
 * Helper to execute render query across all sources
 * @param query The render query parameters
 * @returns A promise that resolves to an array of RenderResult objects
 */
async function renderAll(query: RenderQueryInput): Promise<RenderResult[]> {
  const validSources = query.namespace ? RENDERS.filter(r => r.name === query.namespace) : RENDERS;

  const results = await Promise.all(
    validSources.map(async source => {
      try {
        const res = await fetch(`${source.url}/api/v1/render`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: query.paths, context: query.context }),
        });

        if (!res.ok) {
          console.error(`Error from ${source.name}: ${await res.text()}`);
          return [];
        }

        return (await res.json()) as RenderResult[];
      } catch (error) {
        console.error(`Error rendering with ${source.name}:`, error);
        return [];
      }
    })
  );

  return results.flat() as RenderResult[];
}

/**
 * Helper to generate sitemap from render sources
 * @param filter Optional filter parameters
 * @returns A promise that resolves to a SitemapOutput object
 */
async function renderSitemap(filter?: SitemapFilter): Promise<SitemapOutput> {
  const validSources = filter?.namespace
    ? RENDERS.filter(r => r.name === filter.namespace)
    : RENDERS;

  const entries = await Promise.all(
    validSources.map(async source => {
      try {
        const res = await fetch(
          `${source.url}/api/v1/sitemap${
            filter?.since ? `?since=${filter.since.toISOString()}` : ""
          }`
        );
        if (!res.ok) return [];
        return (await res.json()) as SitemapEntry[];
      } catch (error) {
        console.error(`Error fetching sitemap from ${source.name}:`, error);
        return [];
      }
    })
  );

  const allEntries = entries.flat() as SitemapEntry[];
  const generatedAt = new Date();

  // Generate sitemap XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allEntries
        .map(
          entry => `
        <url>
          <loc>${entry.path}</loc>
          <lastmod>${entry.lastModified}</lastmod>
          ${entry.priority ? `<priority>${entry.priority}</priority>` : ""}
          ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ""}
        </url>
      `
        )
        .join("")}
    </urlset>`;

  return {
    xml,
    json: allEntries,
    generatedAt,
    count: allEntries.length,
  };
}

/**
 * Helper to get index of all available render paths
 * @returns A promise that resolves to an array of RenderIndexEntry objects
 */
async function getRenderIndex(): Promise<RenderIndexEntry[]> {
  const results = await Promise.all(
    RENDERS.map(async source => {
      try {
        const res = await fetch(`${source.url}/api/v1/index`);
        if (!res.ok) return [];
        const entries = (await res.json()) as RenderIndexEntry[];
        return entries.map(entry => ({
          ...entry,
          plugin: source.name,
        }));
      } catch (error) {
        console.error(`Error fetching index from ${source.name}:`, error);
        return [];
      }
    })
  );

  return results.flat() as RenderIndexEntry[];
}

/**
 * Root resolver for the GraphQL schema
 */
const root = {
  v1: {
    renderAll: async ({ query }: { query: RenderQueryInput }) => renderAll(query),
    renderSitemap: async ({ filter }: { filter?: SitemapFilter }) => renderSitemap(filter),
    renderIndex: () => getRenderIndex(),
  },
  JSON: JSONScalar,
  DateTime: DateTimeScalar,
};

const app = express();
app.use(express.json());

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: error => {
      console.error("GraphQL error:", error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);

// Health check endpoint
app.get("/healthz", (req: express.Request, res: express.Response) => {
  res.status(200).send("ok");
});

// GraphiQL interface
app.get("/graphiql", (_req, res) => {
  // Try to find the GraphiQL HTML file in multiple possible locations
  const possiblePaths = [
    path.join(__dirname, "graphiql", "index.html"),
    path.join(__dirname, "..", "graphiql", "index.html"),
    path.join(process.cwd(), "graphiql", "index.html"),
  ];

  let found = false;
  for (const graphiqlPath of possiblePaths) {
    try {
      if (fs.existsSync(graphiqlPath)) {
        const data = fs.readFileSync(graphiqlPath, "utf8");
        res.setHeader("Content-Type", "text/html");
        res.send(data);
        found = true;
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }

  if (!found) {
    // If we couldn't find the file, generate a simple GraphiQL HTML page on the fly
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rendini Mashup GraphQL API</title>
        <style>
          body { height: 100%; margin: 0; width: 100%; overflow: hidden; }
          #graphiql { height: 100vh; }
        </style>
        <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
      </head>
      <body>
        <div id="graphiql"></div>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
        <script>
          const fetchURL = '/graphql';
          function graphQLFetcher(graphQLParams) {
            return fetch(fetchURL, {
              method: 'post',
              headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
              body: JSON.stringify(graphQLParams),
            }).then(response => response.json());
          }
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
            document.getElementById('graphiql'),
          );
        </script>
      </body>
    </html>
    `;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }
});

const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.info(`🚀 Rendini Mashup GraphQL API running at http://localhost:${port}/graphql`);
  console.info(
    `🚀 Rendini Mashup GraphiQL interface available at http://localhost:${port}/graphiql`
  );
  console.info("Port numbers are internal to the container and may differ on the host.");
});
