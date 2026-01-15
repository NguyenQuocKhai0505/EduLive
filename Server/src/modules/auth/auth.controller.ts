import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    signIn(@Body() signInDto: Record<string,any>){
        return this.authService.signIn(signInDto.email, signInDto.password)
    }   
    @Post("logout")
    @UseGuards(AuthGuard)
    async logout(@Req() req:any)
    {
        const token = req.cookies["accessToken"]
        const email=req.user.email
        return this.authService.logout(token,email)
    }
}
