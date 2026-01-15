import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private redis: RedisService
    ){}
    async signIn(email: string, pass: string) {
      
      const lockKey = `lock:${email}`;
      const attemptKey = `attempts:${email}`;
  
      try {
          // 1. Kiểm tra Redis
          const isLocked = await this.redis.get(lockKey);
        
          
          if (isLocked) {
              throw new BadRequestException("The account was locked for 1 minute due to too many incorrect entries.");
          }
  
  
          const user = await this.usersService.findByEmail(email);
          
          // 3. So sánh mật khẩu
        
          const isMatch = user ? await bcrypt.compare(pass, user.password) : false;
         
  
          if (!isMatch) {
              // Tăng số lần sai trong Redis
              const count = await this.redis.incr(attemptKey, 600);
         
              
              if (count >= 5) {
               
                  await this.redis.set(lockKey, 'true', 60);
                  await this.redis.del(attemptKey);
                  throw new BadRequestException('You have entered the wrong information 5 times. Your account is locked for 1 minute.');
              }
              
              throw new UnauthorizedException(`The information is incorrect. You have ${5 - count} attempts remaining.`);
          }
  
         
  
          const payload = { sub: user?.id, email: user?.email, role: user?.role };
         
          
          const token = await this.jwtService.signAsync(payload);
          
          
          return { access_token: token };
  
      } catch (error) {
          
          throw error;
      }
  }
  
}