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
