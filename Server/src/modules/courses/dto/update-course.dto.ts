import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

/**
 * DTO: UpdateCourseDto
 * 
 * MỤC ĐÍCH: Validate dữ liệu khi cập nhật khóa học
 * 
 * PartialType: Tự động làm TẤT CẢ fields từ CreateCourseDto thành optional
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    // Không cần code gì thêm!
    // PartialType tự động:
    // - title?: string (optional)
    // - description?: string (optional)
    // - categoryId?: number (optional)
    // - ... tất cả fields đều optional
}