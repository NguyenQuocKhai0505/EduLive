import { IsString } from 'class-validator';

/** Body gửi tin nhắn; lịch sử chat lấy từ DB theo userId (JWT). */
export class SendMessageDto {
  @IsString()
  message: string;
}
