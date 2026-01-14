import { Entity,Column } from "typeorm";
import {Exclude} from "class-transformer"
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserRole } from "../enums/user-role.enum";

@Entity("users")
export class User extends BaseEntity{
    @Column({unique:true})
    email: string

    @Column()
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

    @Column({default:true})
    isActive: boolean
}