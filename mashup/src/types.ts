// src/types.ts
// Export proper types for the API

export interface RenderTarget {
  name: string;
  template: string;
  renderer: string;
}

export interface RenderRequest {
  name: string;
  data?: Record<string, any>;
  renderer: string;
}

export interface RenderResult {
  html: string;
}
