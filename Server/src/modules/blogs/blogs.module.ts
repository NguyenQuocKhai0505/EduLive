import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog } from './entities/blog.entity';
import { BlogLike } from './entities/blog-like.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Module({
    imports:[
        TypeOrmModule.forFeature([
            Blog,
            BlogLike,
            BlogComment,
            User,
        ]),
        AuthModule,
    ],
    controllers:[BlogsController],
    providers:[BlogsService, CloudinaryService],
    exports:[BlogsService]
})
export class BlogsModule{}