
import { Controller, Get, Post, Body, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
@Controller('users')
 //USE INTERCEPTOR TO PREVENT RETURNING PASSWORD
 @UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(private readonly usersService:UsersService){}

    //ENDPOINT: /users/register
    @Post("register")
    create(@Body() createUserDto:CreateUserDto){
        return this.usersService.create(createUserDto)
    }
    //ENDPOINT: GET/users
    @Get() 
    findAll(){
        return this.usersService.findAll()
    }
}
