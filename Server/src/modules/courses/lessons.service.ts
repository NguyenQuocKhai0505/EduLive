import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Section } from './entities/section.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * SERVICE: LessonsService
 * 
 * MỤC ĐÍCH: Xử lý business logic cho lessons
 * 
 * RESPONSIBILITIES:
 * - CRUD operations cho lessons
 * - Kiểm tra quyền (chỉ owner của course hoặc ADMIN)
 */
@Injectable()
export class LessonsService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonsRepository: Repository<Lesson>,
        @InjectRepository(Section)
        private readonly sectionsRepository: Repository<Section>
    ) {}

    /**
     * Tạo lesson mới
     * 
     * @param createLessonDto - Dữ liệu lesson
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Lesson mới được tạo
     * 
     * PERMISSION: Chỉ TEACHER (owner của course) hoặc ADMIN
     */
    async create(
        createLessonDto: CreateLessonDto,
        userId: number,
        userRole: UserRole
    ): Promise<Lesson> {
        // Kiểm tra quyền
        if (userRole !== UserRole.TEACHER && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("Only teachers and admins can create lessons");
        }

        // Kiểm tra section tồn tại và lấy course
        const section = await this.sectionsRepository.findOne({
            where: { id: createLessonDto.sectionId },
            relations: ['course']
        });

        if (!section) {
            throw new NotFoundException(`Section with ID ${createLessonDto.sectionId} not found`);
        }

        // Kiểm tra quyền: chỉ owner của course hoặc ADMIN
        if (section.course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only add lessons to your own courses");
        }

        // Tạo lesson mới
        const lesson = this.lessonsRepository.create({
            ...createLessonDto,
            type: createLessonDto.type || "video",
            preview: createLessonDto.preview || false,
            order: createLessonDto.order ?? 0
        });

        return await this.lessonsRepository.save(lesson);
    }

    /**
     * Lấy tất cả lessons của một section
     * 
     * @param sectionId - Section ID
     * @returns Mảng các lessons
     */
    async findBySection(sectionId: number): Promise<Lesson[]> {
        return await this.lessonsRepository.find({
            where: { sectionId },
            order: { order: 'ASC' }
        });
    }

    /**
     * Lấy lesson theo ID
     * 
     * @param id - Lesson ID
     * @returns Lesson với đầy đủ thông tin
     */
    async findOne(id: number): Promise<Lesson> {
        const lesson = await this.lessonsRepository.findOne({
            where: { id },
            relations: ['section', 'section.course']
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }

        return lesson;
    }

    /**
     * Cập nhật lesson
     * 
     * @param id - Lesson ID
     * @param updateLessonDto - Dữ liệu cập nhật
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Lesson đã được cập nhật
     * 
     * PERMISSION: Chỉ owner của course hoặc ADMIN
     */
    async update(
        id: number,
        updateLessonDto: UpdateLessonDto,
        userId: number,
        userRole: UserRole
    ): Promise<Lesson> {
        const lesson = await this.findOne(id);

        // Kiểm tra quyền: chỉ owner của course hoặc ADMIN
        if (lesson.section.course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only update lessons in your own courses");
        }

        // Cập nhật
        Object.assign(lesson, updateLessonDto);
        return await this.lessonsRepository.save(lesson);
    }

    /**
     * Xóa lesson
     * 
     * @param id - Lesson ID
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * 
     * PERMISSION: Chỉ owner của course hoặc ADMIN
     */
    async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
        const lesson = await this.findOne(id);

        // Kiểm tra quyền
        if (lesson.section.course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only delete lessons in your own courses");
        }

        await this.lessonsRepository.remove(lesson);
    }
}
