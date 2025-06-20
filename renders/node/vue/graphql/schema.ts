// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

import { buildSchema } from 'graphql';

/**
 * Defines the GraphQL schema for the Rendini Render API
 */
const schemaString = `
  scalar JSON
  scalar DateTime

  type Query {
    """
    API version 1
    """
    v1: V1Query
  }

  type V1Query {
    render(path: String!, params: JSON, context: RenderContextInput): RenderResult!
    renderMap(namespace: String): [RenderEntry!]!
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
    metadata: JSON # Optional metadata returned by the renderer
  }

  type RenderEntry {
    path: String! # e.g. "/docs/getting-started"
    params: JSON # Parameters used to resolve this path
    lastModified: DateTime
    priority: Float
    changeFrequency: String # e.g. "daily", "weekly"
  }
`;

/**
 * Exports the built GraphQL schema for the Rendini Render API
 */
export const schema = buildSchema(schemaString);
