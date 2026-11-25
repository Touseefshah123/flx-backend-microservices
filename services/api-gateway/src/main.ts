import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { registerMiddleware } from './common/middleware/register-middleware';
import {
  registerDocsProxies,
  registerProxies,
} from './modules/proxy/proxy.register-proxies';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  // Nest's own errors (e.g. 404); middleware and proxies build this shape themselves.
  app.useGlobalFilters(new AllExceptionsFilter());

  registerMiddleware(app);

  // Combined Swagger UI; specs load same-origin via registerDocsProxies (services have no CORS).
  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('FLX API Gateway')
      .setVersion('0.1.0')
      .build(),
  );
  SwaggerModule.setup('api-docs', app, doc, {
    // The definition dropdown lives in the explorer bar, which is hidden by default.
    explorer: true,
    swaggerOptions: {
      urls: [
        { url: '/identity-docs-json', name: 'identity-service' },
        { url: '/warehouse-docs-json', name: 'warehouse-service' },
        { url: '/booking-docs-json', name: 'booking-service' },
        { url: '/billing-docs-json', name: 'billing-service' },
        { url: '/operations-docs-json', name: 'operations-service' },
      ],
    },
  });

  registerDocsProxies(app, config);
  registerProxies(app, config);

  // The only publicly reachable process — everything else listens internally.
  await app.listen(config.get<number>('PORT') ?? 8000, '0.0.0.0');
}

void bootstrap();
