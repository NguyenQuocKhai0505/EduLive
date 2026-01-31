import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { In, Repository } from "typeorm";
  import { ConfigService } from "@nestjs/config";
  import { randomBytes } from "crypto";
  import { ChatRoom } from "./entities/chat-room.entity";
  import { ChatMessage } from "./entities/chat-message.entity";
  import { Course } from "../courses/entities/course.entity";
  import { CartItem } from "../cart/entities/cart-item.entity";
  import { CartStatus } from "../cart/enums/cart-status.enum";
  import { Enrollment } from "../enrollments/entities/enrollment.entity";
  import { User } from "../users/entities/user.entity";
  import { UserRole } from "../users/enums/user-role.enum";

  @Injectable()
  export class ChatService{
    private readonly joinTokenTtlMs = 1000 * 60 * 60 * 24 * 7;
    constructor(
        @InjectRepository(ChatRoom)
        private readonly roomRepo: Repository<ChatRoom>,
        @InjectRepository(ChatMessage)
        private readonly messageRepo: Repository<ChatMessage>,
        @InjectRepository(Course)
        private readonly courseRepo: Repository<Course>,
        @InjectRepository(CartItem)
        private readonly cartRepo: Repository<CartItem>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepo: Repository<Enrollment>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService
    ){}

    private buildJoinUrl(token:string){
        const baseUrl = 
        this.configService.get<string>("STUDENT_APP_URL") ||
        "http://localhost:3000"
        return `${baseUrl}/chat/join?token=${token}`
    }

    private generateJoinToken(){
        return randomBytes(32).toString("hex")
    }

    private getTokenExpiry(){
        return new Date(Date.now() + this.joinTokenTtlMs)
    }

    private isTokenExpired(expiresAt?:Date |null){
        if(!expiresAt) return true
        return expiresAt.getTime() < Date.now()
    }

    async createRoom(teacherId:number,courseId:number){
        const course = await this.courseRepo.findOne({where:{id:courseId, isActive:true}})
        if(!course) throw new NotFoundException("Course not found")
        if(course.instructorId !== teacherId){
            throw new ForbiddenException("Only course owner can create chat room")
        }
        const existingRoom = await this.roomRepo.findOne({where:{courseId}})
        if(existingRoom){
            if(this.isTokenExpired(existingRoom.joinTokenExpiresAt)){
                existingRoom.joinToken = this.generateJoinToken()
                existingRoom.joinTokenExpiresAt = this.getTokenExpiry()
                await this.roomRepo.save(existingRoom)
            }
            return {
                ...existingRoom,
                joinUrl: this.buildJoinUrl(existingRoom.joinToken)
            }
        }
        const room = this.roomRepo.create({
            courseId,
            teacherId,
            joinToken: this.generateJoinToken(),
            joinTokenExpiresAt: this.getTokenExpiry(),
            isActive:true
        })
        const saved = await this.roomRepo.save(room)
        return{
            ...saved,
            joinUrl: this.buildJoinUrl(saved.joinToken)
        }
    }
    async joinRoomByToken(token:string,userId:number){
        const room = await this.roomRepo.findOne({
            where:{joinToken:token,isActive:true},
            relations:["course"]
        })
        if(!room) throw new NotFoundException("Chat room not found")
        if(this.isTokenExpired(room.joinTokenExpiresAt)){
            throw new BadRequestException("Join link has expired")
        }
        await this.ensureAccess(room.id,userId)
        return {
            roomId:room.id,
            courseId:room.courseId,
            courseTitle:room.course.title,
            teacherId:room.teacherId
        }

    }

    async getMyRooms(userId:number,role:UserRole){
        if(role === UserRole.TEACHER || role === UserRole.ADMIN){
            return this.roomRepo.find({
                where:{teacherId: userId,isActive:true},
                relations:["course"],
                order:{createdAt:"DESC"}
            })
        } 
        const purchased = await this.cartRepo.find({
            where:{userId,status:CartStatus.PURCHASED}
        })
        const courseIds = purchased.map((item) => item.courseId)
        const enrollments = await this.enrollmentRepo.find({ where: { userId } })
        const enrolledCourseIds = enrollments.map((item) => item.courseId)
        const combinedCourseIds = Array.from(new Set([...courseIds, ...enrolledCourseIds]))
        if (combinedCourseIds.length === 0) return [];

        return this.roomRepo.find({
            where:{courseId:In(combinedCourseIds),isActive:true},
            relations:["course"],
            order:{createdAt:"DESC"}
        })
    }
    async getMessages(roomId:number,userId:number,role?:UserRole){
        await this.ensureAccess(roomId,userId,role)

        const messages = await this.messageRepo.find({
            where:{roomId},
            relations:["sender"],
            order:{createdAt:"ASC"}
        })
        return messages.map((message) =>({
            id:message.id,
            roomId:message.roomId,
            senderId:message.senderId,
            senderRole:message.senderRole,
            content:message.content,
            createdAt:message.createdAt,
            senderName:message.sender?.fullName,
            senderAvatar:message.sender?.avatar,
        }))
    }

    async createMessage(
        roomId:number,
        userId:number,
        content:string,
        role?:UserRole
    ){
        if(!content?.trim()){
            throw new BadRequestException("Message content cannot be empty")
        }
        await this.ensureAccess(roomId,userId,role)
        
        const user = await this.userRepo.findOne({where:{id:userId}})
        if(!user) throw new NotFoundException("User not found")

        const message = this.messageRepo.create({
            roomId,
            senderId:userId,
            senderRole:user.role,
            content:content.trim(),
        })
        const saved = await this.messageRepo.save(message)
        return{
            id:saved.id,
            roomId:saved.roomId,
            senderId:saved.senderId,
            senderRole:saved.senderRole,
            content:saved.content,
            createdAt:saved.createdAt,
            senderName: user.fullName,
            senderAvatar: user.avatar,
        }
    }
    async ensureAccess(roomId: number, userId: number, role?: UserRole) {
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (!room) throw new NotFoundException("Chat room not found");
        if (role === UserRole.ADMIN) return;
        if (room.teacherId === userId) return;
    
        const purchased = await this.cartRepo.findOne({
          where: { userId, courseId: room.courseId, status: CartStatus.PURCHASED },
        });
        if (purchased) return;
    
        const enrollment = await this.enrollmentRepo.findOne({
          where: { userId, courseId: room.courseId },
        });
        if (enrollment) return;
    
        throw new ForbiddenException("You do not have access to this chat room");
    }
    
    async joinRoom(userId:number,roomId:number, role?:UserRole){
        await this.ensureAccess(roomId,userId,role)
        const room = await this.roomRepo.findOne({where:{id:roomId,isActive:true}})
        if(!room) throw new NotFoundException("Chat room not found")
        return room
    }
  }