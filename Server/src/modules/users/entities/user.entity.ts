import { Entity,Column } from "typeorm";
import {Exclude} from "class-transformer"
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserRole } from "../enums/user-role.enum";

@Entity("users")
export class User extends BaseEntity{
    @Column({unique:true})
    email: string

    @Column({nullable:true})
    @Exclude() 
    password: string;

    @Column()
    fullName:string

    @Column({nullable:true})
    avatar:string 

    @Column({type:"text",nullable:true})
    bio: string //Gioi thieu ban than

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.STUDENT
    })
    role:UserRole

    @Column({ type: "text", nullable: true })
    refreshTokenHash: string; 

    @Column({default:true})
    isActive: boolean

    @Column({nullable:true})
    socialId: string

    @Column({nullable:true})
    provider: string

    @Column({default:false})
    isVerified: boolean
}