import {Entity,Column,ManyToOne,JoinColumn, OneToMany} from "typeorm";
import {BaseEntity} from "../../../common/entities/base.entity";
import {Course} from "../../courses/entities/course.entity";
import {ChatMessage} from "./chat-message.entity";

@Entity("chat_rooms")
export class ChatRoom extends BaseEntity{
    @Column()
    courseId:number

    @Column()
    teacherId:number 

    @Column({ unique: true })
    joinToken: string;

    @Column({type:"timestamp",nullable:true})
    joinTokenExpiresAt:Date | null

    @Column({default:true})
    isActive:boolean

    @ManyToOne(() => Course,{onDelete: "CASCADE"})
    @JoinColumn({name:"courseId"})
    course:Course

    @OneToMany(() => ChatMessage, (message) => message.room, {cascade: true})
    message:ChatMessage[]
}