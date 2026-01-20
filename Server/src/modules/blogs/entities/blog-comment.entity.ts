import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Blog } from "./blog.entity";
import { User } from "../../users/entities/user.entity";

/**
 * ENTITY: BlogComment
 * 
 * MỤC ĐÍCH: Lưu trữ comments của users trên blog
 * 
 * GIẢI THÍCH:
 * - Mỗi comment thuộc về 1 blog và 1 user
 * - Có thể có parentId để reply comment (nested comments)
 */
@Entity("blog_comments")
export class BlogComment extends BaseEntity {
    /**
     * Nội dung comment
     */
    @Column({ type: "text" })
    content: string;

    /**
     * ID của blog được comment
     */
    @Column()
    blogId: number;

    /**
     * ID của user comment
     */
    @Column()
    userId: number;

    /**
     * ID của comment cha (nếu là reply)
     * null = comment gốc, có giá trị = reply
     */
    @Column({ nullable: true })
    parentId: number | null;

    /**
     * QUAN HỆ: ManyToOne với Blog
     */
    @ManyToOne(() => Blog, (blog) => blog.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "blogId" })
    blog: Blog;

    /**
     * QUAN HỆ: ManyToOne với User (author)
     */
    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    /**
     * QUAN HỆ: ManyToOne với BlogComment (parent comment)
     * - Để hỗ trợ nested comments (reply)
     */
    @ManyToOne(() => BlogComment, (comment) => comment.replies, { nullable: true })
    @JoinColumn({ name: "parentId" })
    parent: BlogComment;

    /**
     * Danh sách URLs ảnh của comment (nhiều ảnh)
     */
    @Column({type:"simple-array",nullable:true})
    images: string[]; 

    /**
     * QUAN HỆ: OneToMany với BlogComment (replies)
     * - Một comment có thể có nhiều replies
     */
    @OneToMany(() => BlogComment, (comment) => comment.parent)
    replies: BlogComment[];
}