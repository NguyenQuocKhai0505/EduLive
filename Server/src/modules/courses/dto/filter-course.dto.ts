import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO: FilterCourseDto
 * 
 * MỤC ĐÍCH: Validate các query parameters cho filter courses
 * Tất cả fields đều optional - chỉ filter khi có giá trị
 */
export class FilterCourseDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  level?: string; // "Beginner", "Intermediate", "Advanced"

  @IsOptional()
  @IsString()
  language?: string; // "English", "Vietnamese", etc.

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number; // Minimum rating (0-5)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number; // Minimum price

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number; // Maximum price

  @IsOptional()
  @IsString()
  price?: string; // "Free" hoặc "Paid"

  @IsOptional()
  @IsString()
  duration?: string; // "short", "medium", "long", "extra-long"

  @IsOptional()
  @IsString()
  title?: string; // Search by title (LIKE query)

  @IsOptional()
  @Type(() => Boolean)
  video?: boolean; // Has video lessons
}