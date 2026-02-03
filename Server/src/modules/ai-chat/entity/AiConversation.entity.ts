import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AiChatMessage } from './AiChatMessage.entity';

/**
 * Một phiên chat AI của một student.
 * Mỗi user (student) có thể có một hoặc nhiều conversation; mỗi conversation chứa nhiều message.
 */
@Entity('ai_conversations')
export class AiConversation extends BaseEntity {
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => AiChatMessage, (msg) => msg.conversation)
  messages: AiChatMessage[];
}
