import { 
    Injectable, 
    NotFoundException, 
    ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { BlogLike } from './entities/blog-like.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
@Injectable()
export class BlogsService{
    constructor(
        @InjectRepository(Blog)
        private readonly blogRepository: Repository<Blog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(BlogLike)
        private readonly blogLikeRepository: Repository<BlogLike>,
        @InjectRepository(BlogComment)
        private readonly blogCommentRepository: Repository<BlogComment>,
    ){}

    //CREATE BLOG 
    async create(createBlogDto: CreateBlogDto, authorId: number, images?: string[]): Promise<Blog>{
        //Check User 
        const author = await this.userRepository.findOne({where:{id:authorId}})
        if(!author){
            throw new NotFoundException("Author not found")
        }
        //Create Blog
        const blog = this.blogRepository.create({
            ...createBlogDto,
            authorId,
            images: images || [],
            likesCount:0,
            commentsCount:0,
            isActive:true,
            isPublished:true
        })
        return await this.blogRepository.save(blog)
    }
    
    //GET ALL BLOGS 
    async findAll():Promise<Blog[]>{
        const blogs = await this.blogRepository.find({
            where:{
                isActive:true,
                isPublished:true
            },
            relations:["author"],
            order:{createdAt:"DESC"}
        })
        // ✨ Filter blogs có author hợp lệ (tránh lỗi khi author bị xóa)
        return blogs.filter(blog => blog.author !== null && blog.author !== undefined)
    }

    //GET BLOG BY ID 
    async findOne(id:number):Promise<Blog>{
        const blog = await this.blogRepository.findOne({
            where:{id},
            relations:["author"],
        })
        if(!blog){
            throw new NotFoundException("Blog not found")
        }
        return blog
    }

    //UPDATE BLOG
    async update(
        id:number,
        updateBlogDto:UpdateBlogDto,
        userId:number,
        userRole:UserRole
    ):Promise<Blog>{
        const blog = await this.findOne(id)
        //Check authorization and permission
        if(blog.authorId !== userId && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("You are not authorized to update this blog")
        }
        //Update blog
        Object.assign(blog,updateBlogDto)
        return await this.blogRepository.save(blog)
    }
    //REMOVE BLOG (SOFT DELETE)
    async remove(
        id:number,
        userId:number,
        userRole:UserRole
    ):Promise<void>{
        const blog = await this.findOne(id)

        //Check authorization and permission
        if(blog.authorId !== userId && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("You are not authorized to delete this blog")
        }
        //Soft delete
        blog.isActive = false
        blog.isPublished = false
        await this.blogRepository.save(blog)
    }

    //GET BLOGS BY AUTHOR
    async findByAuthor(authorId:number):Promise<Blog[]>{
        const blogs = await this.blogRepository.find({
            where:{
                authorId,
                isActive:true,
                isPublished:true
            },
            relations:["author"],
            order:{createdAt:"DESC"}
        })
        // ✨ Filter blogs có author hợp lệ
        return blogs.filter(blog => blog.author !== null && blog.author !== undefined)
    }

    //TOGGLE LIKE FOR BLOG
    async toggleLike(blogId: number, userId: number): Promise<{ liked: boolean; likesCount: number }> {
        // BƯỚC 1: Kiểm tra blog tồn tại
        const blog = await this.findOne(blogId);

        // BƯỚC 2: Kiểm tra user đã like chưa
        const existingLike = await this.blogLikeRepository.findOne({
            where: { blogId, userId }
        });

        if (existingLike) {
            // ĐÃ LIKE → UNLIKE (xóa)
            await this.blogLikeRepository.remove(existingLike);
            blog.likesCount = Math.max(0, blog.likesCount - 1);  // Giảm counter, tối thiểu = 0
        } else {
            // CHƯA LIKE → LIKE (tạo mới)
            const newLike = this.blogLikeRepository.create({ blogId, userId });
            await this.blogLikeRepository.save(newLike);
            blog.likesCount = blog.likesCount + 1;  // Tăng counter
        }

        // BƯỚC 3: Cập nhật counter trong Blog
        await this.blogRepository.save(blog);

        // BƯỚC 4: Đếm lại số lượng likes thực tế (để đảm bảo chính xác)
        const likesCount = await this.blogLikeRepository.count({
            where: { blogId }
        });

        return {
            liked: !existingLike,  // true nếu vừa like, false nếu vừa unlike
            likesCount
        };
    }

    //CHECK USER LIKED 
    async checkUserLiked(blogId:number,userId:number):Promise<boolean>{
        const like = await this.blogLikeRepository.findOne({
            where:{blogId,userId}
        })
        return !!like //convert object => boolean(true neu co, false neu null)
    }
    //CREATE COMMENT FOR BLOG
    async createComment(
        blogId: number,
        userId: number,
        createCommentDto: CreateCommentDto,
        images?: string[]
    ): Promise<BlogComment | null> {
        // BƯỚC 1: Kiểm tra blog tồn tại
        const blog = await this.findOne(blogId);

        // BƯỚC 2: Nếu có parentId (reply comment), kiểm tra parent comment tồn tại
        if (createCommentDto.parentId) {
            const parentComment = await this.blogCommentRepository.findOne({
                where: { id: createCommentDto.parentId, blogId }
            });
            if (!parentComment) {
                throw new NotFoundException(`Parent comment not found`);
            }
        }

        // BƯỚC 3: Tạo comment mới
        const comment = this.blogCommentRepository.create({
            content: createCommentDto.content,
            blogId,
            userId,
            images: images || [], // Lưu array URLs từ Cloudinary
            parentId: createCommentDto.parentId || null  // null nếu là comment gốc
        });

        const savedComment = await this.blogCommentRepository.save(comment);

        // BƯỚC 4: Cập nhật counter
        blog.commentsCount = blog.commentsCount + 1;
        await this.blogRepository.save(blog);

        // BƯỚC 5: Load thông tin user và parent (nếu có)
        return await this.blogCommentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['user', 'parent']  // JOIN với users và parent comment
        });
    }

    //GET ALL COMMENTS FOR BLOG
    async getComments(blogId: number): Promise<BlogComment[]> {
        return await this.blogCommentRepository.find({
            where: { 
                blogId,
                parentId: IsNull()  // Chỉ lấy comments gốc (không phải reply) - WHERE parentId IS NULL
            },
            relations: [
                'user',           // Load thông tin user (author của comment)
                'replies',        // Load replies (nested comments)
                'replies.user'    // Load thông tin user của replies
            ],
            order: { createdAt: 'DESC' }  // Mới nhất trước
        });
    }

}