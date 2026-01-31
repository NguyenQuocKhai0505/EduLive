import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from "@nestjs/websockets";
  import { OnGatewayConnection } from "@nestjs/websockets";
  import { Logger } from "@nestjs/common";
  import { Server, Socket } from "socket.io";
  import { JwtService } from "@nestjs/jwt";
  import { ConfigService } from "@nestjs/config";
  import { ChatService } from "./chat.service";

  type SocketUser = {
    sub:number;
    role:string
  }

  @WebSocketGateway({
    cors: {
      origin: [
        process.env.STUDENT_APP_URL,
        process.env.TEACHER_APP_URL,
        "http://localhost:3000",
        "http://localhost:3002",
      ].filter(Boolean),
      credentials: true,
    },
  })

export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    server:Server
    private readonly logger = new Logger(ChatGateway.name);
    private readonly rateLimitWindowMs = 3000;
    private readonly rateLimitMaxMessages = 5;
    private readonly messageBuckets = new Map<string, number[]>();
    private readonly metrics = {
        connections: 0,
        joinAttempts: 0,
        sendAttempts: 0,
        sendRejected: 0,
        sendErrors: 0,
    };

    constructor(
        private readonly chatService:ChatService,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService
    ){}

    async handleConnection(client:Socket){
        const user = await this.getUserFromSocket(client)
        if(!user){
            client.disconnect()
            return
        }
        client.data.user = user
        this.metrics.connections += 1;
        this.logger.log(`Socket connected: ${user.sub}`);
    }
    @SubscribeMessage("joinRoom")
    async handleJoinRoom(
        @ConnectedSocket() client:Socket,
        @MessageBody() payload:{roomId:number}
    ){
        const user = client.data.user as SocketUser | undefined
        if(!user) return 
        this.metrics.joinAttempts += 1;
        try{
            await this.chatService.joinRoom(user.sub, payload.roomId, user.role as any)
            client.join(payload.roomId.toString())
            client.emit("joinedRoom",{roomId:payload.roomId})
        }catch(error:any){
            const message = error?.message || "Failed to join room";
            client.emit("chatError", { action: "joinRoom", message });
            this.logger.warn(`Join failed user=${user.sub} room=${payload.roomId} ${message}`);
        }
    }

    @SubscribeMessage("sendMessage")
    async handleSendMessage(
        @ConnectedSocket() client:Socket,
        @MessageBody() payload:{roomId:number,content:string}
    ){
        const user = client.data.user as SocketUser | undefined
        if(!user) return 
        this.metrics.sendAttempts += 1;
        if(!this.checkRateLimit(user.sub.toString())){
            this.metrics.sendRejected += 1;
            client.emit("chatError", { action: "sendMessage", message: "Too many messages. Please slow down." });
            return;
        }
        try{
            const message = await this.chatService.createMessage(
                payload.roomId,
                user.sub,
                payload.content,
                user.role as any
            )
            this.server.to(payload.roomId.toString()).emit("message",message)
        }catch(error:any){
            this.metrics.sendErrors += 1;
            const message = error?.message || "Failed to send message";
            client.emit("chatError", { action: "sendMessage", message });
            this.logger.warn(`Send failed user=${user.sub} room=${payload.roomId} ${message}`);
        }
    }

    private checkRateLimit(clientId: string){
        const now = Date.now();
        const windowStart = now - this.rateLimitWindowMs;
        const bucket = this.messageBuckets.get(clientId) || [];
        const updated = bucket.filter((ts) => ts >= windowStart);
        if(updated.length >= this.rateLimitMaxMessages){
            this.messageBuckets.set(clientId, updated);
            return false;
        }
        updated.push(now);
        this.messageBuckets.set(clientId, updated);
        return true;
    }
    private async getUserFromSocket(client: Socket): Promise<SocketUser | null> {
        const cookieHeader = client.handshake.headers.cookie || "";
        const accessToken = this.getCookieValue(cookieHeader, "accessToken");
        if (!accessToken) return null;
    
        try {
          const payload = await this.jwtService.verifyAsync(accessToken, {
            secret:
              this.configService.get<string>("JWT_ACCESS_SECRET") ||
              this.configService.get<string>("JWT_SECRET"),
          });
          return { sub: payload.sub, role: payload.role };
        } catch {
          return null;
        }
      }
    
      private getCookieValue(cookieHeader: string, name: string) {
        const parts = cookieHeader.split(";").map((part) => part.trim());
        const match = parts.find((part) => part.startsWith(`${name}=`));
        return match ? decodeURIComponent(match.split("=")[1]) : null;
      }
}