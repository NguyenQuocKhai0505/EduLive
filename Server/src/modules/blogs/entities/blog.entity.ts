
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { BlogLike } from "./blog-like.entity";
import { BlogComment } from "./blog-comment.entity";
@Entity("blogs")
export class Blog extends BaseEntity{
    @Column()
    title:string

    @Column({type:"text"})
    content:string

    @Column({type:"simple-array",nullable:true})
    images:string[]

    @Column({type:"simple-array",nullable:true})
    tag: string[]

    //RELATIONSHIP: OneToMany với BlogLike
    // 1 BLOG CAN HAVE MANY LIKES
    @OneToMany(() => BlogLike, (like) => like.blog)
    likes: BlogLike[];

    //RELATIONSHIP: OneToMany với BlogComment
    // 1 BLOG CAN HAVE MANY COMMENTS
    @OneToMany(() => BlogComment, (comment) => comment.blog)
    comments: BlogComment[];
    
    //COUNTER 
    @Column({default:0})
    likesCount: number

    //COUNTER FOR COMMENTS
    @Column({default:0})
    commentsCount: number;

    @Column({default:true})
    isPublished:boolean

    @Column({default:true})
    isActive:boolean
    
    @Column()
    authorId: number;

    @ManyToOne(()=> User)
    @JoinColumn({name:"authorId"})
    author:User

    

}