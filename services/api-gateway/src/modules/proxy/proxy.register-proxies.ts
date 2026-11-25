import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppException } from '../../common/exceptions/app.exception';
import { routesConfig, SOCKET_PREFIXES } from '../../config/routes.config';
export function registerProxies(
  app: INestApplication,
  config: ConfigService,
): void {
  for (const route of routesConfig(config)) {
    // Registered before the prefix proxy and mounted at root, so the upgrade sees the full path and is never rewritten twice.
    if (SOCKET_PREFIXES.includes(route.prefix)) {
      app.use(
        createProxyMiddleware({
          target: route.target,
          changeOrigin: true,
          // The upgrade skips Express middleware; the service re-verifies the signature from the polling handshake.
          ws: true,
          pathFilter: `${route.prefix}/socket.io`,
        }),
      );
    }

    app.use(
      route.prefix,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        // Express strips the mount prefix ('/auth/login' -> '/login'); put it back.
        // A bare prefix arrives as '/', which must not become '/booking/': the service verifies the signed path exactly.
        pathRewrite: (path) =>
          route.prefix +
          (path === '/' || path.startsWith('/?') ? path.slice(1) : path),
        on: {
          // Service down or unreachable: same body shape as every other error.
          error: (_err, _req, res) => {
            if (!('writeHead' in res) || res.headersSent) return;
            const unavailable = new AppException(
              'SERVICE_UNAVAILABLE',
              'Upstream service is unavailable',
              HttpStatus.BAD_GATEWAY,
            );
            res.writeHead(unavailable.getStatus(), {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(unavailable.getResponse()));
          },
        },
      }),
    );
  }
}

// Serves each service's spec from the gateway origin; services have no CORS.
export function registerDocsProxies(
  app: INestApplication,
  config: ConfigService,
): void {
  const docsRoutes = [
    {
      path: '/identity-docs-json',
      target: config.get<string>('IDENTITY_SERVICE_URL')!,
    },
    {
      path: '/warehouse-docs-json',
      target: config.get<string>('WAREHOUSE_SERVICE_URL')!,
    },
    {
      path: '/booking-docs-json',
      target: config.get<string>('BOOKING_SERVICE_URL')!,
    },
    {
      path: '/billing-docs-json',
      target: config.get<string>('BILLING_SERVICE_URL')!,
    },
    {
      path: '/operations-docs-json',
      target: config.get<string>('OPERATIONS_SERVICE_URL')!,
    },
  ];

  for (const route of docsRoutes) {
    app.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: () => '/api-docs-json',
      }),
    );
  }
}
