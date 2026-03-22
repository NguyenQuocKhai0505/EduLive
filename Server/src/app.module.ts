
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { CartModule } from './modules/cart/cart.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { YoutubeCoursesModule } from './modules/youtube-courses/youtube-courses.module';
@Module({
  imports: [
    //Cau hinh de doc env
    ConfigModule.forRoot({
      isGlobal: true //Cac module khac cung dung duoc bien moi truong
    }),
    //Users
    UsersModule,
    AuthModule,
    CoursesModule, // Đăng ký CoursesModule
    EnrollmentsModule,
    BlogsModule,
    CartModule,
    VoucherModule,
    PaymentModule,
    ChatModule,
    AiChatModule,
    YoutubeCoursesModule,
    
    //Cau hinh ket noi Postgres
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: async (configService: ConfigService) =>({
        type:"postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        //Tu dong load file entity
        autoLoadEntities: true,
        // Local: NODE_ENV không set → true. Production: đặt NODE_ENV=production → false (an toàn DB).
        synchronize: process.env.NODE_ENV !== 'production',
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
