import Joi from 'joi';

// The gateway owns no database. It verifies tokens against identity-service's
// public JWKS and proxies onward, so its config stays small.
export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),
  TZ: Joi.string().default('UTC'),
  THROTTLE_TTL_MS: Joi.number().integer().min(1000).default(60000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(60),

  AUTH_JWKS_URL: Joi.string().uri().required(),
  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  INTERNAL_HMAC_SECRET: Joi.string().required(),

  IDENTITY_SERVICE_URL: Joi.string().uri().required(),
  WAREHOUSE_SERVICE_URL: Joi.string().uri().required(),
  BOOKING_SERVICE_URL: Joi.string().uri().required(),
  BILLING_SERVICE_URL: Joi.string().uri().required(),
  OPERATIONS_SERVICE_URL: Joi.string().uri().required(),
  TRANSPORT_SERVICE_URL: Joi.string().uri().required(),
  NOTIFICATION_SERVICE_URL: Joi.string().uri().required(),
});
