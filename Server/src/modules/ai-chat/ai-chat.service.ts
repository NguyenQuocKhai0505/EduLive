import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { AiConversation } from './entity/AiConversation.entity';
import { AiChatMessage } from './entity/AiChatMessage.entity';

@Injectable()
export class AiChatService {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AiConversation)
    private readonly conversationRepo: Repository<AiConversation>,
    @InjectRepository(AiChatMessage)
    private readonly messageRepo: Repository<AiChatMessage>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env');
    this.ai = new GoogleGenAI({ apiKey });
    // gemini-1.5-flash đã 404 trên API hiện tại; dùng gemini-2.0-flash. Có thể set GEMINI_MODEL trong .env
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
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

      // SDK mới: contents là mảng { role, parts: [{ text }] }
      const contents = history.map((msg) => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }],
      }));

      const result = await this.ai.models.generateContent({
        model: this.modelName,
        contents,
      });

      let reply: string = result.text ?? '';
      if (typeof reply !== 'string') reply = String(reply ?? '');
      if (!reply.trim()) {
        reply = 'Xin lỗi, tôi chưa có câu trả lời. Bạn thử hỏi lại nhé.';
      }

      // Lưu reply AI vào DB (theo đoạn chat: conversationId)
      const modelMsg = this.messageRepo.create({
        conversationId: conv.id,
        role: 'model',
        content: reply,
      });
      await this.messageRepo.save(modelMsg);

      return { reply, conversationId: conv.id };
    } catch (err: any) {
      const raw = err?.message || err?.toString?.() || '';
      if (raw.includes('429') || raw.includes('quota') || raw.includes('Too Many Requests')) {
        throw new BadRequestException(
          'Hết hạn mức sử dụng miễn phí của Gemini. Bạn thử lại sau vài phút.',
        );
      }
      throw new BadRequestException(raw || 'Gemini request failed');
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
