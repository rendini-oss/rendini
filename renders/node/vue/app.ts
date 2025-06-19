import { createSSRApp, type App } from 'vue';

interface AppState {
  count: number;
}

export function createApp(): App<Element> {
  return createSSRApp({
    data: (): AppState => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`,
  });
}
