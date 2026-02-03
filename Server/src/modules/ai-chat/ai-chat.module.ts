import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiConversation } from './entity/AiConversation.entity';
import { AiChatMessage } from './entity/AiChatMessage.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([AiConversation, AiChatMessage, User]),
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
