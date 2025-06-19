# Rendini Vue Renderer

This service exposes REST endpoints for listing and rendering Vue components (SSR) for use with the
stand-alone Rendini API.

## Endpoints

- `GET /api/render-targets` — List available Vue components (from `src/views/`)
- `POST /api/render` — Render a Vue component to HTML

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npx ts-node server.ts
   ```

## Note

- This is a minimal SSR demo. For production, use a proper SSR build pipeline and error handling.
- The stand-alone Rendini API will call this service to aggregate Vue render targets and perform
  rendering.
