import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RedisService } from '../../common/redis/redis.service';

@Module({
  imports: [
    UsersModule,
    // Cấu hình JWT lấy secret từ file .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
         
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as any
        },
      }),
    }),
  ],
  providers: [AuthService, RedisService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}