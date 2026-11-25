# FLX Backend Microservices

This repository is being built incrementally, starting with the API gateway. Each service and feature will be added in its own reviewable change.

## API gateway

The NestJS gateway is the public entry point for the backend. It applies security headers, request middleware, rate limiting, JWT verification, and forwards requests to backend services. It also provides a combined Swagger UI.

### Requirements

- Node.js 22.12 or newer
- npm

### Run locally

1. Install dependencies from the repository root:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and adjust the upstream URLs and JWT settings for your environment.

3. Start the gateway:

   ```sh
   npm run start:dev --workspace=api-gateway
   ```

The gateway listens on port 8000 by default. Its upstream services are added to this repository in later changes; requests to unavailable upstreams return `502 Bad Gateway`.

## Development

Build and type-check the gateway with:

```sh
npm run build --workspace=api-gateway
npm run typecheck --workspace=api-gateway
```

Keep credentials in local environment files. Never commit `.env`, private keys, or production secrets.
