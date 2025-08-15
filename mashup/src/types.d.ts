// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

/**
 * TypeScript type declarations for the Rendini Mashup API
 */

/**
 * Represents a render target with name, template, and rendering information
 */
export type RenderTarget = {
  name: string;
  template: string;
  source: string;
};

/**
 * Result object containing rendered HTML content
 */
export type RenderResult = {
  html: string;
};
