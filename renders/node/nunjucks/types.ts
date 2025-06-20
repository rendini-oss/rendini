// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

/**
 * GraphQL API types based on render-api.graphql schema
 */

/**
 * Input context for rendering operations
 */
export interface RenderContextInput {
  device?: string;
  locale?: string;
  userAgent?: string;
  preview?: boolean;
}

/**
 * Result of a rendering operation
 */
export interface RenderResult {
  content: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}

/**
 * Entry in the render map
 */
export interface RenderEntry {
  path: string;
  params?: Record<string, unknown>;
  lastModified?: Date;
  priority?: number;
  changeFrequency?: string;
}

/**
 * JSON type alias
 */
export type JSON = Record<string, unknown>;

/**
 * DateTime type alias
 */
export type DateTime = Date;

/**
 * Legacy API request type
 */
export interface RenderRequest {
  name: string;
  data?: Record<string, unknown>;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  error: string;
}
