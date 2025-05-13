import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.use(cors({
    origin: 'http://localhost:5173', // URL del cliente Vite
    credentials: true
  }));
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  // Configurar prefijo global (opcional)
  // app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log('Servidor corriendo en puerto 3000');
}

bootstrap(); 