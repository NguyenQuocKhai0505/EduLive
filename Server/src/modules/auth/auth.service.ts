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
          // 3. Kiểm tra user có tồn tại và có password không
          if (!user) {
              throw new UnauthorizedException("The information is incorrect.");
          }
          // Nếu user đăng nhập bằng social (không có password), không thể đăng nhập bằng email/password
          if (!user.password) {
              throw new UnauthorizedException("This account was registered with social login. Please use social login to sign in.");
          }
          // 3. So sánh mật khẩu
          const isMatch = await bcrypt.compare(pass, user.password);

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
          
          return { access_token: token,
            user:{
                id:user?.id,
                email: user?.email,
                name: user?.fullName,
                role:user?.role,
                avatar:user?.avatar
            }
           };
  
      } catch (error) {
          
          throw error;
      }
  }
    async logout(token:string,userEmail:string){
            await this.redis.set(`blacklist:${token}`,"true",86400)
            return {message:"Logout Successfully"}
    }
    async validateSocialUser(profile:any){
        const {email,socialId, provider,fullName,avatar}= profile
        let user = await this.usersService.findByEmail(email)

        if (!user) {
            // Tạo user mới nếu chưa có
            user = await this.usersService.create({
              email,
              fullName,
              avatar,
              socialId,
              provider,
              isVerified: true,
              password: "", // Social login không cần pass
            });
          } else {
            // User đã tồn tại - cập nhật thông tin social nếu chưa có
            if (!user.socialId || !user.provider) {
              await this.usersService.update(user.id, {
                socialId,
                provider,
                ...(avatar && !user.avatar && { avatar })
              });
              // Reload user để có dữ liệu mới nhất
              user = await this.usersService.findByEmail(email);
              // Đảm bảo user không null sau khi reload
              if (!user) {
                throw new BadRequestException("Failed to update user information");
              }
            }
          }
        // Đảm bảo user không null trước khi tạo token
        if (!user) {
          throw new BadRequestException("User not found after authentication");
        }
        const payload ={email: user.email,sub:user.id,role:user.role}
        const access_token = await this.jwtService.signAsync(payload);
        return{
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName,
                role: user.role,
                avatar: user.avatar
            }
        }
    }

    // Lấy thông tin user hiện tại
    async getCurrentUser(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        return user;
    }
  
}