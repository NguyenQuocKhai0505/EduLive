import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { YoutubeCourse } from "./entities/youtube-course.entity";
import { YoutubeCoursesService } from "./youtube-courses.service";
import { YoutubeCoursesController } from "./youtube-courses.controller";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../guards/roles.guard";
import { CloudinaryService } from "../../common/services/cloudinary.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([YoutubeCourse]),
    AuthModule, // Cần để dùng AuthGuard và RolesGuard
  ],
  providers: [YoutubeCoursesService, RolesGuard, CloudinaryService],
  controllers: [YoutubeCoursesController],
})
export class YoutubeCoursesModule {}