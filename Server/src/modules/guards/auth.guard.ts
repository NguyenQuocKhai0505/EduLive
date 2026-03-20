import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';


@Injectable()
export class AuthGuard implements CanActivate{
    constructor (
        private jwtService: JwtService,
        private configeService:ConfigService,
        private redis: RedisService
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean>{
        const request = context.switchToHttp().getRequest()
        // Chấp nhận token từ cookie (cùng origin) hoặc header Authorization (cross-origin, ví dụ Student 3000 → API 3001)
        let token = request.cookies['accessToken'];
        if (!token && request.headers?.authorization?.startsWith?.('Bearer ')) {
            token = request.headers.authorization.slice(7);
        }
        if(!token) throw new UnauthorizedException("Can not found token")
        const blacklisted = await this.redis.get(`blacklist:${token}`)
        if(blacklisted) throw new UnauthorizedException("Token has been blacklisted")
        try{
            const payload = await this.jwtService.verifyAsync(token,{
                secret: this.configeService.get<string>("JWT_ACCESS_SECRET") 
                    || this.configeService.get<string>("JWT_SECRET")
            })
            //Gan thong tin user vao request de RolesGuard su dung 
            request["user"] = payload
        }catch{
            throw new UnauthorizedException("The token is invalid or has expired.") 
        }
        return true
    }
}