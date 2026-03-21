import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    /**
     * forwardRef(AuthModule): AuthModule đã import UsersModule → cần forwardRef để tránh vòng phụ thuộc.
     * Lấy AuthGuard, RolesGuard, JwtModule, RedisModule từ AuthModule (một nguồn duy nhất).
     */
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}