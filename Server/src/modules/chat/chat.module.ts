import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ChatRoom } from "./entities/chat-room.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { Course } from "../courses/entities/course.entity";
import { CartItem } from "../cart/entities/cart-item.entity";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { User } from "../users/entities/user.entity";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { CloudinaryService } from "../../common/services/cloudinary.service";
import { RedisModule } from "../../common/redis/redis.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatMessage,
      Course,
      CartItem,
      Enrollment,
      User,
    ]),
    JwtModule.register({}),
    RedisModule,
  ],
  providers: [ChatService, ChatGateway, CloudinaryService],
  controllers: [ChatController],
})
export class ChatModule {}