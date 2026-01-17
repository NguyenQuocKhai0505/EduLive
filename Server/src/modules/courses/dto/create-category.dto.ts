import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO: CreateCategoryDto
 * 
 * MỤC ĐÍCH: Validate dữ liệu khi tạo category mới
 */
export class CreateCategoryDto {
    @IsNotEmpty({ message: "Category name cannot be left blank" })
    @IsString()
    name: string; // Bắt buộc

    @IsOptional()
    @IsString()
    slug?: string; // Optional - sẽ tự generate nếu không có

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}