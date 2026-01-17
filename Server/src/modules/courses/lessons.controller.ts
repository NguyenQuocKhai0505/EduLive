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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';

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
    constructor(private readonly lessonsService: LessonsService) {}

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
