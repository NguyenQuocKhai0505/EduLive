import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  // thêm rawBody: true
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());

  const allowedOrigins = [
    process.env.TEACHER_APP_URL,
    process.env.STUDENT_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });

  await app.listen(3001);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:bootstrap',message:'Nest started',data:{port:3001,nodeVersion:process.version},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion agent log
}
bootstrap();