
import { Controller, Get, Post, Body, UseInterceptors, ClassSerializerInterceptor, UseGuards, Req, Patch,Param,NotFoundException,ParseIntPipe, Query } from '@nestjs/common';
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
    findAll(@Query('role') role?: string){
        if (role) {
            return this.usersService.findByRole(role as UserRole);
        }
        return this.usersService.findAll()
    }

    @Patch("me/password")
    @UseGuards(AuthGuard)
    changePassword(@Body() dto: ChangePasswordDto, @Req() req:any){
        return this.usersService.changePassword(req.user.sub,dto.currentPassword,dto.newPassword)
    }

    //ENDPOINT: GET /users/:id
    @Get(":id")
    async findOne(@Param("id",ParseIntPipe) id:number){
        const user = await this.usersService.findOne(id)
        if(!user){
            throw new NotFoundException("User not found")
        }
        return{
            id:user.id,
            email:user.email,
            name:user.fullName,
            role:user.role,
            bio:user.bio,
            avatar:user.avatar,
            createdAt:user.createdAt,
        }
    }

    /**
     * PATCH /users/:id/toggle-active
     * 
     * Toggle trạng thái active của user (CHỈ ADMIN)
     * 
     * PERMISSION: ADMIN only
     * 
     * ⚠️ BẢO MẬT: Admin không thể tự khóa chính mình
     */
    @Patch(":id/toggle-active")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async toggleActiveStatus(
        @Param("id", ParseIntPipe) userId: number,
        @Req() req: any
    ) {
        const adminId = req.user.sub; // ID của admin đang thực hiện
        const adminRole = req.user.role; // Role của admin (phải là ADMIN)
        
        return await this.usersService.toggleActiveStatus(userId, adminId, adminRole);
    }
}
