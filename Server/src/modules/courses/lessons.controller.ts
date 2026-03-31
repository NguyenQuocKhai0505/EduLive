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
    BadRequestException,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { tmpdir } from 'os';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { videoFileFilter } from '../../common/utils/file-upload.util';

/** Mặc định 1GB/file — tăng bằng LESSON_UPLOAD_MAX_FILE_BYTES (byte) nếu cần. */
const LESSON_VIDEO_MAX_BYTES =
    Number(process.env.LESSON_UPLOAD_MAX_FILE_BYTES) || 1 * 1024 * 1024 * 1024;

function formatUploadErr(err: unknown): string {
    if (!err) return 'Unknown error';
    const e = err as any;
    const msg =
        e?.message ||
        e?.error?.message ||
        e?.response?.data?.error?.message ||
        e?.response?.data?.message;
    const code = e?.code || e?.errno;
    const httpCode = e?.http_code || e?.statusCode || e?.response?.status;
    const parts = [msg, code ? `code=${code}` : '', httpCode ? `http=${httpCode}` : '']
        .filter(Boolean)
        .join(' ');
    return parts || 'Unknown error';
}

/**
 * CONTROLLER: LessonsController
 * 
 * MỤC ĐÍCH: Xử lý HTTP requests/responses cho lessons
 * 
 * BASE PATH: /lessons
 * 
 * ENDPOINTS:
 * - POST   /lessons                - Tạo lesson mới (TEACHER/ADMIN)
 * - GET    /lessons/section/:sectionId - Lấy lessons của section (PUBLIC)
 * - GET    /lessons/:id            - Lấy lesson theo ID (PUBLIC)
 * - PATCH  /lessons/:id            - Cập nhật lesson (OWNER/ADMIN)
 * - DELETE /lessons/:id            - Xóa lesson (OWNER/ADMIN)
 */
@Controller('lessons')
export class LessonsController {
    constructor(
        private readonly lessonsService: LessonsService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    /**
     * POST /lessons
     * 
     * Tạo lesson mới
     * 
     * PERMISSION: TEACHER hoặc ADMIN
     */
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async create(@Body() createLessonDto: CreateLessonDto, @Req() req: any) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.lessonsService.create(createLessonDto, userId, userRole);
    }

    /**
     * POST /lessons/upload/videos
     * 
     * Upload nhiều video lên Cloudinary và trả về secure_url
     * 
     * PERMISSION: TEACHER hoặc ADMIN
     */
    @Post('upload/videos')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @UseInterceptors(
        FilesInterceptor('videos', 5, {
            storage: diskStorage({
                destination: tmpdir(),
                filename: (req, file, cb) => {
                    cb(null, `lesson-${randomUUID()}${extname(file.originalname)}`);
                },
            }),
            fileFilter: videoFileFilter,
            limits: {
                fileSize: LESSON_VIDEO_MAX_BYTES,
            },
        })
    )
    async uploadVideos(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Video files are required');
        }

        const urls: string[] = [];
        for (const file of files) {
            const path = (file as Express.Multer.File & { path?: string }).path;
            if (!path) {
                throw new BadRequestException('Upload failed: missing temp file path');
            }
            try {
                const url = await this.cloudinaryService.uploadLargeVideoFromPath(
                    path,
                    'lessons'
                );
                urls.push(url);
            } catch (err: unknown) {
                const raw = formatUploadErr(err);
                // Render/containers thường giới hạn /tmp; lỗi phổ biến là ENOSPC (no space left on device)
                if (raw.toLowerCase().includes('enospc') || raw.toLowerCase().includes('no space')) {
                    throw new BadRequestException(
                        `Upload failed (server temp storage full). Try a smaller video, split the video, or switch to direct-to-Cloudinary upload. Detail: ${raw}`
                    );
                }
                throw new BadRequestException(
                    `Upload failed for "${file.originalname}". Detail: ${raw}`
                );
            } finally {
                this.cloudinaryService.tryUnlink(path);
            }
        }
        return { urls };
    }

    /**
     * GET /lessons/section/:sectionId
     * 
     * Lấy tất cả lessons của một section
     * 
     * PERMISSION: PUBLIC
     */
    @Get('section/:sectionId')
    async findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
        return await this.lessonsService.findBySection(sectionId);
    }

    /**
     * GET /lessons/:id
     * 
     * Lấy lesson theo ID
     * 
     * PERMISSION: PUBLIC
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.lessonsService.findOne(id);
    }

    /**
     * PATCH /lessons/:id
     * 
     * Cập nhật lesson
     * 
     * PERMISSION: OWNER (instructor) hoặc ADMIN
     */
    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateLessonDto: UpdateLessonDto,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.lessonsService.update(id, updateLessonDto, userId, userRole);
    }

    /**
     * DELETE /lessons/:id
     * 
     * Xóa lesson
     * 
     * PERMISSION: OWNER (instructor) hoặc ADMIN
     */
    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        await this.lessonsService.remove(id, userId, userRole);
    }
}
