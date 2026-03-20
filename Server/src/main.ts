import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  // thêm rawBody: true
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());

  const allowedOrigins = [
    process.env.ADMIN_APP_URL,
    process.env.TEACHER_APP_URL,
    process.env.STUDENT_APP_URL,
    'http://localhost:3000', //Student
    'http://localhost:3001', //Server
    'http://localhost:3002', //Teacher
    'http://localhost:3003', // Admin app
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(3001);
}
bootstrap();