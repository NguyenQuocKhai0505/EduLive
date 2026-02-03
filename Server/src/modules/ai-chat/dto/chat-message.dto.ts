import { IsIn, IsString } from 'class-validator';

/** Một tin nhắn trong lịch sử chat (user hoặc AI) */
export class ChatMessageDto {
  @IsIn(['user', 'model'])
  role: 'user' | 'model';

  @IsString()
  content: string;
}