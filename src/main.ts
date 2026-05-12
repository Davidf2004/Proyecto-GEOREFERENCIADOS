import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { setupApplicationInsights } from './telemetry/application-insights';

async function bootstrap() {
  setupApplicationInsights(envs.APPLICATIONINSIGHTS_CONNECTION_STRING);

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(envs.PORT);
}
bootstrap();
