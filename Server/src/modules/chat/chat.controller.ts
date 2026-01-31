import { Controller, Get, Post, Body, Param, UseGuards, Query, Req, ParseIntPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decirator";
import { UserRole } from "../users/enums/user-role.enum";
import { CreateRoomDto } from "./dto/create-room.dto";
import { JoinRoomDto } from "./dto/join-room.dto";

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController{
    constructor(private readonly chatService:ChatService){}

    @Post("rooms")
    @UseGuards(RolesGuard)
    @Roles(UserRole.TEACHER,UserRole.ADMIN)
    createRoom(@Body() dto:CreateRoomDto,@Req() req:any){
        return this.chatService.createRoom(req.user.sub, dto.courseId)
    }

    @Get("rooms/my")
    getMyRooms(@Req() req: any) {
        return this.chatService.getMyRooms(req.user.sub, req.user.role);
    }
    
    @Post("join")
    joinRoom(@Body() dto: JoinRoomDto, @Req() req: any) {
        return this.chatService.joinRoomByToken(dto.token, req.user.sub)
    }
    @Get("rooms/:roomId/messages")
    getMessages(@Param("roomId", ParseIntPipe) roomId: number, @Req() req: any) {
      return this.chatService.getMessages(roomId, req.user.sub, req.user.role);
    }
}