
import { Controller, Get, Post, Body, UseInterceptors, ClassSerializerInterceptor, UseGuards, Req, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from './enums/user-role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
 //USE INTERCEPTOR TO PREVENT RETURNING PASSWORD
 @UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(private readonly usersService:UsersService){}

    /**
     * POST /users/register
     * 
     * Đăng ký tài khoản mới (PUBLIC)
     * 
     * ⚠️ BẢO MẬT: Chỉ cho phép đăng ký với role STUDENT
     * Nếu user cố gắng set role ADMIN hoặc TEACHER → Lỗi 403
     * 
     * ADMIN và TEACHER chỉ có thể được tạo bởi ADMIN qua endpoint /users/create
     */
    @Post("register")
    create(@Body() createUserDto:CreateUserDto){
        return this.usersService.create(createUserDto)
    }
    
    /**
     * POST /users/create
     * 
     * Tạo user với role cụ thể (CHỈ ADMIN)
     * 
     * PERMISSION: ADMIN only
     * 
     * Sử dụng để tạo TEACHER hoặc ADMIN khác
     */
    @Post("create")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createWithRole(@Body() createUserDto: CreateUserDto, @Req() req: any) {
        // Admin có thể tạo user với bất kỳ role nào
        return this.usersService.createWithRole(createUserDto);
    }
    
    //ENDPOINT: GET/users
    @Get() 
    findAll(){
        return this.usersService.findAll()
    }

    @Patch("me/password")
    @UseGuards(AuthGuard)
    changePassword(@Body() dto: ChangePasswordDto, @Req() req:any){
        return this.usersService.changePassword(req.user.sub,dto.currentPassword,dto.newPassword)
    }
}
