// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 Rendini Labs

import { createSSRApp, type App } from 'vue';

/**
 * Interface for the application state
 */
interface AppState {
  count: number;
}

/**
 * Creates a new Vue SSR application instance
 * @returns A Vue application instance configured for server-side rendering
 */
export function createApp(): App<Element> {
  return createSSRApp({
    data: (): AppState => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`,
  });
}
