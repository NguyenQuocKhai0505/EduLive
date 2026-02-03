import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { AiConversation } from './entity/AiConversation.entity';
import { AiChatMessage } from './entity/AiChatMessage.entity';

@Injectable()
export class AiChatService {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AiConversation)
    private readonly conversationRepo: Repository<AiConversation>,
    @InjectRepository(AiChatMessage)
    private readonly messageRepo: Repository<AiChatMessage>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env');
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /** Lấy hoặc tạo conversation cho user (mỗi user một conversation đang dùng). */
  async getOrCreateConversation(userId: number): Promise<AiConversation> {
    let conv = await this.conversationRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!conv) {
      conv = this.conversationRepo.create({ userId });
      await this.conversationRepo.save(conv);
    }
    return conv;
  }

  /** Gửi tin nhắn: lưu vào DB, gọi Gemini, lưu reply, trả về reply. */
  async sendMessage(
    userId: number,
    message: string,
  ): Promise<{ reply: string; conversationId: number }> {
    try {
      const conv = await this.getOrCreateConversation(userId);

      // Lưu tin nhắn user
      const userMsg = this.messageRepo.create({
        conversationId: conv.id,
        role: 'user',
        content: message,
      });
      await this.messageRepo.save(userMsg);

      // Lấy 20 tin gần nhất từ DB, rồi sắp xếp lại theo thời gian tăng dần cho Gemini
      const historyRows = await this.messageRepo.find({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      const history = historyRows.reverse();

      const contents: Content[] = history.map((msg) => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }],
      }));

      const result = await this.model.generateContent({ contents });
      const reply = result.response.text();

      // Lưu reply AI vào DB
      const modelMsg = this.messageRepo.create({
        conversationId: conv.id,
        role: 'model',
        content: reply,
      });
      await this.messageRepo.save(modelMsg);

      return { reply, conversationId: conv.id };
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Gemini request failed');
    }
  }

  /** Lấy toàn bộ tin nhắn của conversation hiện tại (để hiển thị lịch sử chat). */
  async getMessagesByUserId(userId: number): Promise<{ conversationId: number; messages: { role: string; content: string; createdAt: Date }[] }> {
    const conv = await this.getOrCreateConversation(userId);
    const messages = await this.messageRepo.find({
      where: { conversationId: conv.id },
      order: { createdAt: 'ASC' },
    });
    return {
      conversationId: conv.id,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  }
}
