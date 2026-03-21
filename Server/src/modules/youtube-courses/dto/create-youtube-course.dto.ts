import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateYoutubeCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  durationLabel?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
