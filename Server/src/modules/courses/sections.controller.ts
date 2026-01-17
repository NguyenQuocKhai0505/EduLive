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
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { LessonsService } from './lessons.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * CONTROLLER: SectionsController
 * 
 * MỤC ĐÍCH: Xử lý HTTP requests/responses cho sections và lessons (nested)
 * 
 * BASE PATH: /sections (standalone) hoặc /courses/:courseId/sections (nested)
 * 
 * ENDPOINTS (Standalone - vẫn giữ để tương thích):
 * - POST   /sections              - Tạo section mới (TEACHER/ADMIN)
 * - GET    /sections/course/:courseId - Lấy sections của course (PUBLIC)
 * - GET    /sections/:id           - Lấy section theo ID (PUBLIC)
 * - PATCH  /sections/:id          - Cập nhật section (OWNER/ADMIN)
 * - DELETE /sections/:id           - Xóa section (OWNER/ADMIN)
 * 
 * ENDPOINTS (Nested - trong CoursesController):
 * - POST   /courses/:courseId/sections - Tạo section (TEACHER/ADMIN)
 * - GET    /courses/:courseId/sections - Lấy sections (PUBLIC)
 * - GET    /courses/:courseId/sections/:sectionId - Lấy section chi tiết (PUBLIC)
 * - PATCH  /courses/:courseId/sections/:sectionId - Cập nhật section (OWNER/ADMIN)
 * - DELETE /courses/:courseId/sections/:sectionId - Xóa section (OWNER/ADMIN)
 * 
 * ENDPOINTS (Nested - Lessons trong Section):
 * - POST   /courses/:courseId/sections/:sectionId/lessons - Tạo lesson (TEACHER/ADMIN)
 * - GET    /courses/:courseId/sections/:sectionId/lessons - Lấy lessons (PUBLIC)
 * - GET    /courses/:courseId/sections/:sectionId/lessons/:lessonId - Lấy lesson chi tiết (PUBLIC)
 * - PATCH  /courses/:courseId/sections/:sectionId/lessons/:lessonId - Cập nhật lesson (OWNER/ADMIN)
 * - DELETE /courses/:courseId/sections/:sectionId/lessons/:lessonId - Xóa lesson (OWNER/ADMIN)
 */
@Controller('sections')
export class SectionsController {
    constructor(
        private readonly sectionsService: SectionsService,
        private readonly lessonsService: LessonsService
    ) {}

    /**
     * POST /sections
     * 
     * Tạo section mới
     * 
     * PERMISSION: TEACHER hoặc ADMIN
     */
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async create(@Body() createSectionDto: CreateSectionDto, @Req() req: any) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.sectionsService.create(createSectionDto, userId, userRole);
    }

    /**
     * GET /sections/course/:courseId
     * 
     * Lấy tất cả sections của một course
     * 
     * PERMISSION: PUBLIC
     */
    @Get('course/:courseId')
    async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        return await this.sectionsService.findByCourse(courseId);
    }

    /**
     * GET /sections/:id
     * 
     * Lấy section theo ID
     * 
     * PERMISSION: PUBLIC
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.sectionsService.findOne(id);
    }

    /**
     * PATCH /sections/:id
     * 
     * Cập nhật section
     * 
     * PERMISSION: OWNER (instructor) hoặc ADMIN
     */
    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSectionDto: UpdateSectionDto,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.sectionsService.update(id, updateSectionDto, userId, userRole);
    }

    /**
     * DELETE /sections/:id
     * 
     * Xóa section
     * 
     * PERMISSION: OWNER (instructor) hoặc ADMIN
     * 
     * NOTE: Khi xóa section, tất cả lessons trong section sẽ bị xóa (CASCADE)
     */
    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        await this.sectionsService.remove(id, userId, userRole);
    }

    // ============================================
    // NESTED ROUTES: LESSONS (Nằm trong Section)
    // ============================================
    // Note: Các routes này được định nghĩa trong CoursesController
    // nhưng logic được xử lý ở đây để tái sử dụng code

    /**
     * POST /courses/:courseId/sections/:sectionId/lessons
     * 
     * Tạo lesson mới trong section
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     * 
     * NOTE: Route này được định nghĩa trong CoursesController nhưng
     * có thể được gọi từ đây nếu cần
     */
    async createLessonNested(
        sectionId: number,
        createLessonDto: Omit<CreateLessonDto, 'sectionId'>,
        userId: number,
        userRole: UserRole
    ) {
        return await this.lessonsService.create(
            { ...createLessonDto, sectionId },
            userId,
            userRole
        );
    }
}
