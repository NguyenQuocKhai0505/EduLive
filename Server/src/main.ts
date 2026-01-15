import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  //Cho phep tat ca cac ten mien fontend truy cap
  app.enableCors({
    origin: 'http://localhost:3000',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
  await app.listen(3001);
}
bootstrap();
