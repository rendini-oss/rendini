// GraphQL API types based on render-api.graphql schema
export interface RenderContextInput {
  device?: string;
  locale?: string;
  userAgent?: string;
  preview?: boolean;
}

export interface RenderResult {
  content: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}

export interface RenderEntry {
  path: string;
  params?: Record<string, unknown>;
  lastModified?: Date;
  priority?: number;
  changeFrequency?: string;
}

// Convenience type aliases
export type JSON = Record<string, unknown>;
export type DateTime = Date;

// Legacy API types
export interface RenderRequest {
  name: string;
  data?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: string;
}
