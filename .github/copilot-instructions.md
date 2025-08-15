We're building a collection of "Rendini" web rendering APIs including the "Rendini Render API" and
"Rendini Mashup API" to enable AI-first web rendering of component graphs.

## Code Style Guidelines

- Use EditorConfig and Prettier for general formatting and style configuration
- Individual lines should wrap at less than 100 characters (matching our Prettier printWidth
  configuration)
- Prefer the words "render" and "rendering" over "renderer"
- Prefer the word "renders" over "renderers"

## File Headers

All new source files must begin with an SPDX header matching our LICENSE (Apache-2.0) and include
Copyright (c) [year] Rendini Labs.

## GraphQL Schemas

All GraphQL schemas must follow semantic versioning with a "v" prefix (e.g. v1, v2, etc.).

## TypeScript Style

- Use double-quotes
- Use 2-space indents
- Include JSDoc comments on every exported function
