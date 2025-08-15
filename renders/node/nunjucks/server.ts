// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

import express from "express";
import type { RequestHandler } from "express";
import nunjucks from "nunjucks";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { graphql } from "graphql";
import cors from "cors";
import { schema } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(express.json());
app.use(cors());

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Configure Nunjucks template engine
// In development, the pages are in the root 'pages' directory
// In production (after build), they should be in 'dist/pages'
const templatesPath = fs.existsSync(path.join(__dirname, "pages"))
  ? path.join(__dirname, "pages")
  : path.join(__dirname, "../pages");

nunjucks.configure(templatesPath, {
  autoescape: true,
  express: app,
});

// Create pages directory if it doesn't exist
if (!fs.existsSync(templatesPath)) {
  fs.mkdirSync(templatesPath, { recursive: true });
}

// Health check endpoint for Kubernetes readiness probe
const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).send("ok");
};
app.get("/healthz", healthCheck);

// GraphQL endpoint
app.post("/graphql", async (req, res) => {
  const { query, variables, operationName } = req.body;
  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      variableValues: variables,
      operationName,
    });
    res.json(result);
  } catch (error) {
    console.error("GraphQL Error:", error);
    res.status(500).json({ errors: [{ message: "Internal server error" }] });
  }
});

// GraphiQL interface
app.get("/graphiql", (_req, res) => {
  // Try to find the GraphiQL HTML file in multiple possible locations
  const possiblePaths = [
    path.join(__dirname, "graphiql", "index.html"),
    path.join(__dirname, "..", "graphiql", "index.html"),
    path.join(process.cwd(), "graphiql", "index.html"),
  ];

  // Try each path until we find the file
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
        <title>Rendini Nunjucks GraphQL API</title>
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

// Redirect root to GraphiQL for easy testing
app.get("/", (_req, res) => {
  res.redirect("/graphiql");
});

// Start server
app.listen(port, () => {
  console.info(`🚀 Rendini Nunjucks GraphQL API running at http://localhost:${port}/graphql`);
  console.info(
    `🚀 Rendini Nunjucks GraphiQL interface available at http://localhost:${port}/graphiql`
  );
  console.info("Port numbers are internal to the container and may differ on the host.");
});
yes;
