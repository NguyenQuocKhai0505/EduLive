import { Controller, Post, Get, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { AiChatService } from './ai-chat.service';

@Controller('ai-chat')
@UseGuards(AuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  /** Gửi tin nhắn; userId lấy từ JWT (req.user.sub). Tin nhắn và reply được lưu DB theo userId. */
  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found in request');
    return this.aiChatService.sendMessage(userId, dto.message);
  }

  /** Lấy lịch sử chat của student (theo userId từ JWT). */
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found in request');
    return this.aiChatService.getMessagesByUserId(userId);
  }
}
