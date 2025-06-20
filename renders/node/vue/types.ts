export interface RenderTarget {
  name: string;
  description: string;
}

export interface RenderRequest {
  name: string;
  data?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: string;
}

// GraphQL schema types
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

export type JSON = Record<string, unknown>;
export type DateTime = Date;
