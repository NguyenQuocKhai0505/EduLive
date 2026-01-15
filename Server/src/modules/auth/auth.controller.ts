import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req,Get,Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
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
    
   // 1. Route kích hoạt đăng nhập Google
    @Get('google')
    @UseGuards(PassportAuthGuard('google'))
    async googleAuth(@Req() req) {
        // Guard sẽ tự động chuyển hướng người dùng sang Google
    }
    @Get('google/callback')
    @UseGuards(PassportAuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
    // Gọi service đã sửa ở trên
    const result = await this.authService.validateSocialUser(req.user);
    
    // Trả token về cho Client qua Cookie để Frontend dễ lấy
    res.cookie('accessToken', result.access_token, { 
        httpOnly: false,
        sameSite: 'lax',
        secure: false, // Set true nếu dùng HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Lưu user info vào cookie để frontend có thể lấy ngay
    res.cookie('userInfo', JSON.stringify(result.user), {
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    });
    
    // Redirect về frontend callback page (trong popup)
    // Callback page sẽ lấy token từ cookie và gửi về parent window
    return res.redirect('http://localhost:3000/auth/google/callback'); 
}

    // Endpoint để lấy thông tin user hiện tại
    @Get('me')
    @UseGuards(AuthGuard)
    async getCurrentUser(@Req() req: any) {
        const email = req.user.email;
        const user = await this.authService.getCurrentUser(email);
        return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            avatar: user.avatar
        };
    }
}
