import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO: CreateSectionDto
 * 
 * MỤC ĐÍCH: Validate dữ liệu khi tạo section mới
 */
export class CreateSectionDto {
    @IsNotEmpty({ message: "Section title cannot be left blank" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "Course ID is required" })
    @IsNumber()
    courseId: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: "Order must be >= 0" })
    order?: number;
}
