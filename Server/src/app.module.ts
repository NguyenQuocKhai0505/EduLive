
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
        //Tu tao bang khi chay app
        //true khi local, false khi production
        synchronize:true
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
