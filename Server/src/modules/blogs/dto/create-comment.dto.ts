import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: "Content cannot be left blank" })
    @IsString()
    content: string;

    @IsOptional()
    @IsNumber()
    parentId?: number; // ID của comment cha (nếu là reply)
}