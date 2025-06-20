// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

/**
 * Represents a render target with name, template, and renderer information
 */
export interface RenderTarget {
  name: string;
  template: string;
  renderer: string;
}

/**
 * Request object for rendering content
 */
export interface RenderRequest {
  name: string;
  data?: Record<string, any>;
  renderer: string;
}

/**
 * Result object containing rendered HTML content
 */
export interface RenderResult {
  html: string;
}
