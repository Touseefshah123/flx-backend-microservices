import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH!,
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH!,
  keyId: process.env.JWT_KEY_ID!,
  issuer: process.env.JWT_ISSUER!,
  audience: process.env.JWT_AUDIENCE!,
  refreshAudience: process.env.JWT_REFRESH_AUDIENCE!,
  accessTtl: process.env.JWT_ACCESS_TTL!,
  refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 1),
}));
