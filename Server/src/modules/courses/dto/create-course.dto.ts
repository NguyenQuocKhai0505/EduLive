import { 
    IsNotEmpty, 
    IsString, 
    IsNumber, 
    IsOptional, 
    IsArray, 
    IsEnum, 
    Min 
} from 'class-validator';

/**
 * DTO: CreateCourseDto
 * 
 * MỤC ĐÍCH: Validate dữ liệu khi tạo khóa học mới
 * 
 * VALIDATION: Tự động kiểm tra dữ liệu trước khi vào Service
 */
export class CreateCourseDto{
    @IsNotEmpty({message:"Title cannot be left blank"})
    @IsString()
    title:string

     
    @IsNotEmpty({message:"Description cannot be left blank"})
    @IsString()
    description:string

     // Category ID (bắt buộc - phải tồn tại trong database)
    @IsNotEmpty({message:"Category is required"})
    @IsNumber()
    categoryId:number

    @IsOptional()
    @IsString()
    thumbnail:string

    @IsOptional()
    @IsEnum(["Beginner","Intermediate","Advanced"])
    level?:string

    @IsOptional()
    @IsString()
    language:string

    @IsOptional()
    @IsNumber()
    @Min(0,{message:"Price cannot be negative"})
    price?:number

    @IsOptional()
    @IsNumber()
    @Min(0)
    originalPrice?: number

    @IsOptional()
    @IsArray()
    whatYouWillLean?:string[]

}