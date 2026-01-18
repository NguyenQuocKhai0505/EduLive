import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RedisService } from '../../common/redis/redis.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
// import { FacebookStrategy } from './strategies/facebook.strategy'; // Tạm thời ẩn
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
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
  providers: [AuthService, RedisService,GoogleStrategy,/*FacebookStrategy,*/JwtStrategy], // Tạm thời ẩn FacebookStrategy
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // Export JwtModule để các module khác có thể dùng AuthGuard
})
export class AuthModule {}