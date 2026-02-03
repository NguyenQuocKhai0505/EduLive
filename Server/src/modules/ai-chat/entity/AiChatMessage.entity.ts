import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AiConversation } from './AiConversation.entity';

@Entity('ai_chat_messages')
export class AiChatMessage extends BaseEntity {
  @Column()
  conversationId: number;

  /** 'user' = tin nhắn học viên, 'model' = tin nhắn AI */
  @Column({ type: 'varchar', length: 10 })
  role: 'user' | 'model';

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => AiConversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: AiConversation;
}
