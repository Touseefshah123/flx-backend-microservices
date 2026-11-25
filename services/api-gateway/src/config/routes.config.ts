import { ConfigService } from '@nestjs/config';

export interface ServiceRoute {
  prefix: string;
  target: string;
}

export const routesConfig = (config: ConfigService): ServiceRoute[] => [
  // Credentials and tokens live in identity-service; the /auth paths stay so clients do not change.
  { prefix: '/auth', target: config.get<string>('IDENTITY_SERVICE_URL')! },
  {
    prefix: '/identity',
    target: config.get<string>('IDENTITY_SERVICE_URL')!,
  },
  {
    prefix: '/warehouse',
    target: config.get<string>('WAREHOUSE_SERVICE_URL')!,
  },
  {
    prefix: '/booking',
    target: config.get<string>('BOOKING_SERVICE_URL')!,
  },
  {
    prefix: '/billing',
    target: config.get<string>('BILLING_SERVICE_URL')!,
  },
  {
    prefix: '/operations',
    target: config.get<string>('OPERATIONS_SERVICE_URL')!,
  },
  {
    prefix: '/transport',
    target: config.get<string>('TRANSPORT_SERVICE_URL')!,
  },
  {
    prefix: '/notification',
    target: config.get<string>('NOTIFICATION_SERVICE_URL')!,
  },
];

// Exact paths that don't require a valid access token before proxying.
export const PUBLIC_PATHS = [
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/identity-docs-json',
  '/warehouse-docs-json',
  '/booking-docs-json',
  '/billing-docs-json',
  '/operations-docs-json',
  // Exact match only: a prefix here would also unguard the seller authoring routes.
  '/warehouse/listings',
  // PayTabs cannot carry our JWT; billing verifies the PayTabs HMAC itself.
  '/billing/payments/paytabs/callback',
  '/billing/payments/paytabs/return',
];

// Path prefixes (not exact matches) that don't require a token — swagger-ui
// serves several sub-paths (css/js/the page itself) under one mount point.
export const PUBLIC_PREFIXES = [
  '/api-docs',
  // Trailing slash so only the :listingId route matches, never a sibling path.
  '/warehouse/compliance/compliance-status/',
];

// Services that run a socket.io server at <prefix>/socket.io; only these get a websocket upgrade proxy.
export const SOCKET_PREFIXES = ['/booking'];
