// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema, GraphQLScalarType } from "graphql";
import fetch from "node-fetch";
import { RenderTarget, RenderRequest, RenderResult } from "./types.js";

// Configurable rendering endpoints
const RENDERS = [
  { name: "nunjucks", url: process.env.RENDINI_RENDER_NUNJUCKS_URL || "http://localhost:3001" },
  { name: "vue", url: process.env.RENDINI_RENDER_VUE_URL || "http://localhost:3002" },
];

// GraphQL schema
const schema = buildSchema(`
  type RenderTarget {
    name: String!
    template: String!
    source: String!
  }
  type RenderResult {
    html: String!
  }
  type Query {
    """
    API version 1
    """
    v1: V1Query
  }
  type V1Query {
    renderTargets: [RenderTarget!]!
  }
  type Mutation {
    """
    API version 1
    """
    v1: V1Mutation
  }
  type V1Mutation {
    render(name: String!, data: JSON, source: String!): RenderResult!
  }
  scalar JSON
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
 * Helper to aggregate render targets from all renders
 * @returns A promise that resolves to an array of RenderTarget objects
 */
async function getAllRenderTargets(): Promise<RenderTarget[]> {
  const results = await Promise.all(
    RENDERS.map(async source => {
      try {
        const res = await fetch(`${source.url}/api/render-targets`);
        if (!res.ok) return [];
        const targets = (await res.json()) as any[];
        return targets.map((t: any) => ({ ...t, source: source.name }));
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
        return [];
      }
    })
  );
  return results.flat();
}

/**
 * Helper to proxy render call to the correct source
 * @param args The render request parameters
 * @returns A promise that resolves to a RenderResult
 */
async function renderTemplate(args: RenderRequest): Promise<RenderResult> {
  const { name, data, source } = args;
  const r = RENDERS.find(r => r.name === source);
  if (!r) throw new Error(`source not found: ${source}`);

  try {
    const res = await fetch(`${r.url}/api/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Render failed (${res.status}): ${errorText}`);
    }

    return (await res.json()) as RenderResult;
  } catch (error) {
    console.error(`Error rendering with ${source}:`, error);
    throw error;
  }
}

/**
 * Root resolver for the GraphQL schema
 */
const root = {
  v1: {
    renderTargets: getAllRenderTargets,
  },
  Mutation: {
    v1: {
      render: renderTemplate,
    },
  },
  JSON: JSONScalar,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rendini API listening on port ${PORT}`);
});
