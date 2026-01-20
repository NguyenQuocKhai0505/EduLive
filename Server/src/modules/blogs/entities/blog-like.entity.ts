import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Blog } from "./blog.entity";
import { User } from "../../users/entities/user.entity";

@Entity("blog_likes")
@Unique(["blogId", "userId"]) // Mỗi user chỉ like 1 blog 1 lần
export class BlogLike extends BaseEntity {
    /**
     * ID của blog được like
     */
    @Column()
    blogId: number;

    /**
     * ID của user like
     */
    @Column()
    userId: number;

    /**
     * QUAN HỆ: ManyToOne với Blog
     * - Nhiều likes thuộc về 1 blog
     */
    @ManyToOne(() => Blog, (blog) => blog.likes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "blogId" })
    blog: Blog;

    /**
     * QUAN HỆ: ManyToOne với User
     * - Nhiều likes thuộc về 1 user
     */
    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;
}