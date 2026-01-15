import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthGuard implements CanActivate{
    constructor (
        private jwtService: JwtService,
        private configeService:ConfigService,
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean>{
        const request = context.switchToHttp().getRequest()
        const token = request.cookies['accessToken'];
        if(!token) throw new UnauthorizedException("Can not found token")

        try{
            const payload = await this.jwtService.verifyAsync(token,{
                secret: this.configeService.get<string>("JWT_SECRET")
            })
            //Gan thong tin user vao request de RolesGuard su dung 
            request["user"] = payload
        }catch{
            throw new UnauthorizedException("The token is invalid or has expired.") 
        }
        return true
    }
}