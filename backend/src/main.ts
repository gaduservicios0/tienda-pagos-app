import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Encabezados de seguridad OWASP
  app.use(
    helmet({
      contentSecurityPolicy: false, // Permite cargar Swagger UI sin bloqueos
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Orígenes permitidos (S3, variable de entorno y local)
  const origenesPermitidos = [
    'http://tienda-pagos-frontend-app.s3-website-us-east-1.amazonaws.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (process.env.CORS_ORIGIN) {
    origenesPermitidos.push(process.env.CORS_ORIGIN);
  }

  // Habilitar CORS con soporte para preflight (OPTIONS)
  app.enableCors({
    origin: true, // Permite cualquier origen de forma dinámica reflejando el header
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  // Prefijo global de rutas
  app.setGlobalPrefix('api');

  // Validaciones globales estrictas de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación OpenAPI/Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Tienda y Pasarela de Pagos')
    .setDescription('Microservicio para gestión de productos, órdenes y pagos Sandbox')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();