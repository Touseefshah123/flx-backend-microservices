import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import environmentValidations from './config/environment-validations';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuthenticateMiddleware } from './common/middleware/authenticate.middleware';
import { JwtVerifier } from './modules/auth/jwt-verifier';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environmentValidations,
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL_MS') ?? 60000,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 60,
          },
        ],
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    JwtVerifier,
    AuthenticateMiddleware,
    RequestIdMiddleware,
  ],
})
// RequestIdMiddleware and AuthenticateMiddleware are providers here but are
// mounted in main.ts, not via configure() — see the ordering note there.
export class AppModule {}
