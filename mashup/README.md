# Rendini API

This is the stand-alone API server for the Rendini platform. It aggregates registered renderer
services (e.g., Nunjucks, Vue.js) and exposes unified GraphQL endpoints for listing and rendering
components.

## Development

- Configure renderer service URLs via environment variables:
  - `NUNJUCKS_RENDERER_URL` (default: http://localhost:3001)
  - `VUE_RENDERER_URL` (default: http://localhost:3002)
- Start the API server:

```bash
npm install
npm run start
```

- Access GraphQL at: http://localhost:3000/graphql

## Registering Render APIs

The API expects each renderer service to expose:

- `GET /api/render-targets` → List available templates/components
- `POST /api/render` (body: `{ name, data }`) → Render a template/component

See the Nunjucks and Vue.js renderer projects for implementation details.
