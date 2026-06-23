import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import helmet from 'helmet';
import { Callback, Context, Handler } from 'aws-lambda';
import { BookingsService } from './bookings/bookings.service';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);
    
    // Configurar cabeceras de seguridad Helmet (igual que en main.ts)
    nestApp.use(helmet());

    // Configurar políticas de CORS (igual que en main.ts)
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:4200', 'http://127.0.0.1:4200'];

    nestApp.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await nestApp.init();

    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  // Manejar calentamiento de Lambda (Warmup) si aplica
  if (event.source === 'serverless-plugin-warmup') {
    console.log('Warmup event received');
    return 'warmed';
  }
  const server = await bootstrapServer();
  return server(event, context, callback);
};

export const cronHandler: Handler = async (event: any, context: Context) => {
  console.log('Cron event received: expiring old bookings...');
  const nestApp = await NestFactory.createApplicationContext(AppModule);
  const bookingsService = nestApp.get(BookingsService);
  await bookingsService.expireOldBookings();
  await nestApp.close();
  console.log('Cron event finished successfully.');
  return { success: true };
};
