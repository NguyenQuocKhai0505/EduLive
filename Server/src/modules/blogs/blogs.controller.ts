import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BlogsService } from './blogs.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';
import { imageFileFilter } from '../../common/utils/file-upload.util';

/**
 * CONTROLLER
 * 
 * ENDPOINTS:
 * -POST /blogs: Create a new blog (auth)
 * -GET  /blogs: Get all blogs (public)
 * -GET  /blogs/:id: Get a blog by id (public)
 * -PATCH /blogs/:id  Update a blog (owner/admin)
 * -DELETE /blogs/:id  Delete a blog (owner/admin)
 * -POST  /blogs/:id/like  Like/Unlike blog(auth)
 * -GET  /blogs/:id/liked  Check user liked blog(auth)
 * -POST /blogs/:id/comments Create a comment(auth)
 * -GET /blogs/:id/comments Get all comments for a blog(public)
 */
@Controller("blogs")
export class BlogsController{
    constructor(
        private readonly blogsService: BlogsService,
        private readonly cloudinaryService: CloudinaryService
    ){}
    
    //CREATE BLOGS 
    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: memoryStorage(), // Lưu vào memory (buffer) để upload lên Cloudinary
            fileFilter: imageFileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB per file
            },
        })
    )
    async create(
        @Body() createBlogDto: CreateBlogDto,
        @Req() req: any,
        @UploadedFiles() files: Express.Multer.File[]
    ){
        const authorId = req.user.sub;
        
        // Upload images lên Cloudinary
        let imageUrls: string[] = [];
        if (files && files.length > 0) {
            imageUrls = await this.cloudinaryService.uploadMultipleImages(files, 'blogs');
        }
        
        return await this.blogsService.create(createBlogDto, authorId, imageUrls);
    }
    //GET BLOGS
    @Get()
    async findAll(){
        return await this.blogsService.findAll()
    }
    
    //GET BLOG BY ID 
    @Get(":id")
    async findOne(@Param("id",ParseIntPipe) id:number){
        return await this.blogsService.findOne(id)
    }

    //GET BLOGS BY AUTHOR
    @Get("author/:authorId")
    async findByAuthor(@Param("authorId",ParseIntPipe) authorId:number){
        return await this.blogsService.findByAuthor(authorId)
    }

    //UPDATE BLOG
    @Patch(":id")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.TEACHER,UserRole.STUDENT)
    async update(
        @Param("id",ParseIntPipe) id:number,
        @Body() updateBlogDto:UpdateBlogDto,
        @Req() req:any
    ){
        const userId = req.user.sub
        const userRole = req.user.role
        return await this.blogsService.update(id,updateBlogDto,userId,userRole)
    }

    //DELETE BLOG
    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    @HttpCode(HttpStatus.NO_CONTENT) // Trả về 204
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        await this.blogsService.remove(id, userId, userRole);
    }

    //TOGGLE LIKE FOR BLOG
    @Post(":id/like")
    @UseGuards(AuthGuard)
    async toggleLike(@Param("id",ParseIntPipe) id:number, @Req() req:any){
        const userId = req.user.sub
        return await this.blogsService.toggleLike(id,userId)
    }
    
    //CHECK USER LIKED 
    @Get(":id/liked")
    @UseGuards(AuthGuard)
    async checkUserLiked(@Param("id",ParseIntPipe) id:number, @Req() req:any){
        const userId = req.user.sub
        const liked = await this.blogsService.checkUserLiked(id,userId)
        return {liked}
    }

    //CREATE COMMENT FOR BLOG
    @Post(':id/comments')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FilesInterceptor('images', 10, { // Cho phép nhiều ảnh cho comment
            storage: memoryStorage(), // Lưu vào memory (buffer) để upload lên Cloudinary
            fileFilter: imageFileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB per file
            },
        })
    )
    async createComment(
        @Param('id', ParseIntPipe) id: number,
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: any,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        const userId = req.user.sub;
        
        // Upload images lên Cloudinary
        let imageUrls: string[] = [];
        if (files && files.length > 0) {
            imageUrls = await this.cloudinaryService.uploadMultipleImages(files, 'comments');
        }
        
        return await this.blogsService.createComment(id, userId, createCommentDto, imageUrls);
    }

    //GET ALL COMMENTS FOR BLOG
    @Get(':id/comments')
    async getComments(@Param('id', ParseIntPipe) id: number){
        return await this.blogsService.getComments(id)
    }
}