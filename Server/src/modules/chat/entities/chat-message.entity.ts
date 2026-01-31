import {Entity,Column,ManyToOne,JoinColumn} from "typeorm";
import {BaseEntity} from "../../../common/entities/base.entity";
import {ChatRoom} from "./chat-room.entity";
import {User} from "../../users/entities/user.entity";
import {UserRole} from "../../users/enums/user-role.enum";

@Entity("chat_messages")
export class ChatMessage extends BaseEntity{
    @Column()
    roomId:number 

    @Column()
    senderId:number

    @Column({type:"text"})
    content:string

    @Column({type:"enum",enum:UserRole})
    senderRole:UserRole

    @ManyToOne(() => ChatRoom,(room)=>room.message,{onDelete:"CASCADE"})
    @JoinColumn({name:"roomId"})
    room:ChatRoom

    @ManyToOne(() => User,{onDelete:"CASCADE"})
    @JoinColumn({name:"senderId"})
    sender:User
}