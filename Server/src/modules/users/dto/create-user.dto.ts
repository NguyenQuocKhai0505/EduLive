
import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto{
    @IsNotEmpty({message:"Email address cannot be left blank."})
    @IsEmail({},{message:"Email is in the wrong format."})
    email:string

    @ValidateIf((o) => !o.provider) // Chỉ validate password nếu không phải social login
    @IsNotEmpty({message:"Password cannot be left blank"})
    @MinLength(6,{message:"Password muse be more 6 characters"})
    @IsOptional()
    password?:string 

    @IsNotEmpty({message:"Full name cannot be left blank"})
    @IsString()
    fullName:string 

    @IsOptional()
    @IsString()
    avatar?:string

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Bio không được quá 500 ký tự' })
    bio?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Role không hợp lệ' })
    role?: UserRole;

    @IsOptional()
    @IsString()
    socialId?:string

    @IsOptional()
    @IsString()
    provider?: string 

    @IsOptional()
    isVerified?:boolean
}