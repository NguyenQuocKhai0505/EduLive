import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';

/**
 * DTO: CreateLessonDto
 * 
 * MỤC ĐÍCH: Validate dữ liệu khi tạo lesson mới
 */
export class CreateLessonDto {
    @IsNotEmpty({ message: "Lesson title cannot be left blank" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "Section ID is required" })
    @IsNumber()
    sectionId: number;

    @IsOptional()
    @IsString()
    time?: string; // Ví dụ: "5:00", "10:30"

    @IsOptional()
    @IsEnum(["video", "article", "quiz"], {
        message: "Type must be one of: video, article, quiz"
    })
    type?: "video" | "article" | "quiz";

    @IsOptional()
    @IsBoolean()
    preview?: boolean; // Bài học có preview miễn phí không

    @IsOptional()
    @IsString()
    videoUrl?: string; // URL video nếu type = "video"

    @IsOptional()
    @IsString()
    content?: string; // Nội dung text nếu type = "article" hoặc "quiz"

    @IsOptional()
    @IsNumber()
    @Min(0, { message: "Order must be >= 0" })
    order?: number;
}
