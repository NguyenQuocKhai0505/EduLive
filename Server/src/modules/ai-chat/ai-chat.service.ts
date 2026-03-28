import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { AiConversation } from './entity/AiConversation.entity';
import { AiChatMessage } from './entity/AiChatMessage.entity';

type HistoryMsg = { role: string; content: string };

@Injectable()
export class AiChatService {
  private geminiClient: GoogleGenAI | null = null;
  private readonly geminiModelName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AiConversation)
    private readonly conversationRepo: Repository<AiConversation>,
    @InjectRepository(AiChatMessage)
    private readonly messageRepo: Repository<AiChatMessage>,
  ) {
    // Tên model Google GenAI (Gemini API). Có thể override bằng GEMINI_MODEL trong .env
    this.geminiModelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
  }

  private getGeminiClient(): GoogleGenAI | null {
    if (this.geminiClient) return this.geminiClient;
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey?.trim()) return null;
    this.geminiClient = new GoogleGenAI({ apiKey });
    return this.geminiClient;
  }

  private hasGroq(): boolean {
    return !!this.configService.get<string>('GROQ_API_KEY')?.trim();
  }

  /** Bất kỳ endpoint nào giống OpenAI POST .../chat/completions */
  private hasOpenAiCompat(): boolean {
    const url = this.configService.get<string>('OPENAI_COMPAT_URL')?.trim();
    const key = this.configService.get<string>('OPENAI_COMPAT_API_KEY')?.trim();
    const model = this.configService.get<string>('OPENAI_COMPAT_MODEL')?.trim();
    return !!(url && key && model);
  }

  private isQuotaOrRateLimitError(err: unknown): boolean {
    const raw = this.stringifyErr(err);
    return (
      raw.includes('429') ||
      raw.toLowerCase().includes('quota') ||
      raw.includes('Too Many Requests') ||
      raw.includes('RESOURCE_EXHAUSTED') ||
      raw.toLowerCase().includes('rate limit')
    );
  }

  private stringifyErr(err: unknown): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    const e = err as { message?: string; response?: { data?: unknown; status?: number } };
    const parts = [e.message, e.response?.status?.toString(), JSON.stringify(e.response?.data ?? '')];
    return parts.filter(Boolean).join(' ');
  }

  private buildOpenAiStyleMessages(history: HistoryMsg[]): {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[] {
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content:
          'Bạn là trợ lý học tập EduLive: thân thiện, chính xác. Trả lời ngắn gọn; nếu học viên dùng tiếng Việt thì trả lời tiếng Việt.',
      },
    ];
    for (const msg of history) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content,
      });
    }
    return messages;
  }

  /** Gọi endpoint OpenAI-compatible (Groq, OpenRouter, Together, Ollama /v1, …) */
  private async postChatCompletions(
    endpointUrl: string,
    apiKey: string,
    model: string,
    history: HistoryMsg[],
    extraHeaders?: Record<string, string>,
  ): Promise<string> {
    const messages = this.buildOpenAiStyleMessages(history);
    const { data } = await axios.post<{
      choices?: { message?: { content?: string } }[];
    }>(
      endpointUrl,
      { model, messages },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
        timeout: 120_000,
      },
    );
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }

  private async callGemini(history: HistoryMsg[]): Promise<string> {
    const ai = this.getGeminiClient();
    if (!ai) throw new Error('GEMINI_API_KEY chưa cấu hình');

    const contents = history.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    const result = await ai.models.generateContent({
      model: this.geminiModelName,
      contents,
    });

    let reply: string = result.text ?? '';
    if (typeof reply !== 'string') reply = String(reply ?? '');
    return reply.trim();
  }

  private async callGroq(history: HistoryMsg[]): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey?.trim()) throw new Error('GROQ_API_KEY chưa cấu hình');
    const model =
      this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    return this.postChatCompletions(
      'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model,
      history,
    );
  }

  /** OpenRouter / Together / LM Studio / Ollama (OpenAI API) … */
  private async callOpenAiCompat(history: HistoryMsg[]): Promise<string> {
    const url = this.configService.get<string>('OPENAI_COMPAT_URL')?.trim();
    const apiKey = this.configService.get<string>('OPENAI_COMPAT_API_KEY')?.trim();
    const model = this.configService.get<string>('OPENAI_COMPAT_MODEL')?.trim();
    if (!url || !apiKey || !model) {
      throw new Error('Thiếu OPENAI_COMPAT_URL, OPENAI_COMPAT_API_KEY hoặc OPENAI_COMPAT_MODEL');
    }
    const referer = this.configService.get<string>('OPENAI_COMPAT_HTTP_REFERER')?.trim();
    const title = this.configService.get<string>('OPENAI_COMPAT_X_TITLE')?.trim();
    const extra: Record<string, string> = {};
    if (referer) extra['HTTP-Referer'] = referer;
    if (title) extra['X-Title'] = title;
    return this.postChatCompletions(url, apiKey, model, history, extra);
  }

  private async generateReply(history: HistoryMsg[]): Promise<string> {
    const provider = (
      this.configService.get<string>('AI_CHAT_PROVIDER') || 'auto'
    )
      .trim()
      .toLowerCase();

    const geminiOk = !!this.getGeminiClient();
    const groqOk = this.hasGroq();
    const compatOk = this.hasOpenAiCompat();

    if (!geminiOk && !groqOk && !compatOk) {
      throw new BadRequestException(
        'Chưa cấu hình AI trong .env: dùng GEMINI_API_KEY, hoặc GROQ_API_KEY, hoặc bộ OPENAI_COMPAT_* (OpenRouter / Together / Ollama…).',
      );
    }

    if (provider === 'openai_compat') {
      return await this.callOpenAiCompat(history);
    }
    if (provider === 'groq') {
      return await this.callGroq(history);
    }
    if (provider === 'gemini') {
      return await this.callGemini(history);
    }

    // auto: Gemini → hết quota thì Groq → không có Groq thì OpenAI-compat
    if (geminiOk) {
      try {
        return await this.callGemini(history);
      } catch (err) {
        if (!this.isQuotaOrRateLimitError(err)) throw err;
        if (groqOk) return await this.callGroq(history);
        if (compatOk) return await this.callOpenAiCompat(history);
        throw err;
      }
    }
    if (groqOk) return await this.callGroq(history);
    if (compatOk) return await this.callOpenAiCompat(history);

    throw new BadRequestException('Không có provider AI khả dụng.');
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

  /** Gửi tin nhắn: lưu DB → gọi AI → lưu reply. */
  async sendMessage(
    userId: number,
    message: string,
  ): Promise<{ reply: string; conversationId: number }> {
    try {
      const conv = await this.getOrCreateConversation(userId);

      const userMsg = this.messageRepo.create({
        conversationId: conv.id,
        role: 'user',
        content: message,
      });
      await this.messageRepo.save(userMsg);

      const historyRows = await this.messageRepo.find({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      const history: HistoryMsg[] = historyRows.reverse().map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let reply = await this.generateReply(history);
      if (!reply.trim()) {
        reply = 'Xin lỗi, tôi chưa có câu trả lời. Bạn thử hỏi lại nhé.';
      }

      const modelMsg = this.messageRepo.create({
        conversationId: conv.id,
        role: 'model',
        content: reply,
      });
      await this.messageRepo.save(modelMsg);

      return { reply, conversationId: conv.id };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;

      const raw = this.stringifyErr(err);
      if (
        this.isQuotaOrRateLimitError(err) &&
        !this.hasGroq() &&
        !this.hasOpenAiCompat()
      ) {
        throw new BadRequestException(
          'Gemini đã hết mức free. Thêm GROQ_API_KEY hoặc OPENAI_COMPAT_* (vd OpenRouter) trong .env, hoặc thử lại sau.',
        );
      }
      throw new BadRequestException(raw || 'AI request failed');
    }
  }

  /** Lấy toàn bộ tin nhắn của conversation hiện tại (để hiển thị lịch sử chat). */
  async getMessagesByUserId(
    userId: number,
  ): Promise<{
    conversationId: number;
    messages: { role: string; content: string; createdAt: Date }[];
  }> {
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
