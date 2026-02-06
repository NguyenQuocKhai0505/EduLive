import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ChatService } from "./chat.service";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decirator";
import { UserRole } from "../users/enums/user-role.enum";
import { CreateRoomDto } from "./dto/create-room.dto";
import { JoinRoomDto } from "./dto/join-room.dto";
import { imageFileFilter } from "../../common/utils/file-upload.util";

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post("rooms")
    @UseGuards(RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    createRoom(@Body() dto: CreateRoomDto, @Req() req: any) {
        return this.chatService.createRoom(req.user.sub, dto.courseId);
    }

    @Get("rooms/my")
    getMyRooms(@Req() req: any) {
        return this.chatService.getMyRooms(req.user.sub, req.user.role);
    }

    /** Admin only: lấy tất cả phòng chat (giám sát). */
    @Get("rooms/all")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getAllRooms(@Req() req: any) {
        return this.chatService.getAllRoomsForAdmin();
    }

    @Post("join")
    joinRoom(@Body() dto: JoinRoomDto, @Req() req: any) {
        return this.chatService.joinRoomByToken(dto.token, req.user.sub);
    }

    @Get("rooms/:roomId/messages")
    getMessages(@Param("roomId", ParseIntPipe) roomId: number, @Req() req: any) {
        return this.chatService.getMessages(roomId, req.user.sub, req.user.role);
    }

    /** Upload ảnh đính kèm tin nhắn. Chỉ ảnh (jpg, png, gif, webp), tối đa 5MB. */
    @Post("rooms/:roomId/upload")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: memoryStorage(),
            fileFilter: imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 },
        })
    )
    async uploadAttachment(
        @Param("roomId", ParseIntPipe) roomId: number,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        if (!file) throw new BadRequestException("File is required");
        return this.chatService.uploadChatFile(roomId, req.user.sub, file, req.user.role);
    }
}