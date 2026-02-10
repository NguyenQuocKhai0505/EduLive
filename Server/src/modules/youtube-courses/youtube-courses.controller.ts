import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { YoutubeCoursesService } from "./youtube-courses.service";
import { CreateYoutubeCourseDto } from "./dto/create-youtube-course.dto";
import { UpdateYoutubeCourseDto } from "./dto/update-youtube-course.dto";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decirator";
import { UserRole } from "../users/enums/user-role.enum";
import { CloudinaryService } from "../../common/services/cloudinary.service";
import { imageFileFilter } from "../../common/utils/file-upload.util";

@Controller("youtube-courses")
export class YoutubeCoursesController {
  constructor(
    private readonly service: YoutubeCoursesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

    //Private: Admin only
    @Post()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto:CreateYoutubeCourseDto){
        return this.service.create(dto)
    }

    //Public
    @Get()
    findAll() {
      return this.service.findAll();
    }

    /**
     * GET /youtube-courses/fetch-metadata?url=...
     *
     * Lấy metadata (title, author, thumbnail) từ YouTube URL
     *
     * PERMISSION: ADMIN only (để tránh abuse)
     */
    @Get("fetch-metadata")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async fetchMetadata(@Query("url") url: string) {
      if (!url) {
        throw new BadRequestException("YouTube URL is required");
      }
      return this.service.fetchMetadataFromUrl(url);
    }

    @Patch(":id")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)

    update(@Param("id",ParseIntPipe) id:number,@Body() dto:UpdateYoutubeCourseDto){
        return this.service.update(id,dto)
    }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /**
   * POST /youtube-courses/:id/thumbnail
   *
   * Upload thumbnail lên Cloudinary và cập nhật youtube course
   *
   * PERMISSION: ADMIN only
   */
  @Post(":id/thumbnail")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })
  )
  async uploadThumbnail(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException("Thumbnail file is required");
    }

    const url = await this.cloudinaryService.uploadImage(file, "youtube-courses");
    const course = await this.service.update(id, { thumbnailUrl: url });

    return { thumbnailUrl: url, course };
  }
}