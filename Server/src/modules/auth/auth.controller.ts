import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req,Get,Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}


    @Post("login")
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() signInDto: Record<string,any>, @Res() res){
        // 1) Xac thuc email + password, service se tao access/refresh token
        const result = await this.authService.signIn(signInDto.email, signInDto.password)

        // 2) Luu access token vao cookie (ngan han)
        res.cookie("accessToken", result.access_token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // set true khi deploy https
            maxAge: 15 * 60 * 1000,
        })

        // 3) Luu refresh token vao cookie (dai han)
        //    Refresh token duoc tao trong service (getTokens),
        //    sau do hash va luu DB. O day chi set cookie ban goc.
        res.cookie("refreshToken", result.refresh_token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // set true khi deploy https
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // 4) Tra ve user (khong tra token raw)
        return res.json({ user: result.user })
    }   
    @Post("logout")
    @UseGuards(AuthGuard)
    async logout(@Req() req:any, @Res() res)
    {
        const token = req.cookies["accessToken"]
        const email=req.user.email
        const result = await this.authService.logout(token,email)
        // clear cookies client-side
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return res.json(result)
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
    // Gọi service: tao access + refresh token cho user social
    const result = await this.authService.validateSocialUser(req.user);
    
    // Luu access token vao cookie (ngan han)
    res.cookie('accessToken', result.access_token, { 
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Set true nếu dùng HTTPS
        maxAge: 15 * 60 * 1000
    });

    // Luu refresh token vao cookie (dai han)
    // Refresh token duoc tao trong service, hash luu DB de bao mat
    res.cookie('refreshToken', result.refresh_token, { 
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Set true nếu dùng HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Luu user info vao cookie de frontend lay ngay (tuy chon)
    res.cookie('userInfo', JSON.stringify(result.user), {
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    });
    
    // Redirect ve frontend callback page
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

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies["refreshToken"];
    const result = await this.authService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true khi deploy https
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true khi deploy https
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: result.accessToken });
    }
}
