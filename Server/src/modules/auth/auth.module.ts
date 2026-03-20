import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
// import { FacebookStrategy } from './strategies/facebook.strategy'; // Tạm thời ẩn
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from '../guards/auth.guard';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    RedisModule,
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
  providers: [AuthService, AuthGuard, GoogleStrategy,/*FacebookStrategy,*/JwtStrategy], // Tạm thời ẩn FacebookStrategy
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuthGuard, RedisModule],
})
export class AuthModule {}