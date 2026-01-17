import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { Course } from './entities/course.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * SERVICE: SectionsService
 * 
 * MỤC ĐÍCH: Xử lý business logic cho sections
 * 
 * RESPONSIBILITIES:
 * - CRUD operations cho sections
 * - Kiểm tra quyền (chỉ owner của course hoặc ADMIN)
 */
@Injectable()
export class SectionsService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionsRepository: Repository<Section>,
        @InjectRepository(Course)
        private readonly coursesRepository: Repository<Course>
    ) {}

    /**
     * Tạo section mới
     * 
     * @param createSectionDto - Dữ liệu section
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Section mới được tạo
     * 
     * PERMISSION: Chỉ TEACHER (owner của course) hoặc ADMIN
     */
    async create(
        createSectionDto: CreateSectionDto,
        userId: number,
        userRole: UserRole
    ): Promise<Section> {
        // Kiểm tra quyền
        if (userRole !== UserRole.TEACHER && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("Only teachers and admins can create sections");
        }

        // Kiểm tra course tồn tại
        const course = await this.coursesRepository.findOne({
            where: { id: createSectionDto.courseId }
        });

        if (!course) {
            throw new NotFoundException(`Course with ID ${createSectionDto.courseId} not found`);
        }

        // Kiểm tra quyền: chỉ owner hoặc ADMIN
        if (course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only add sections to your own courses");
        }

        // Tạo section mới
        const section = this.sectionsRepository.create({
            ...createSectionDto,
            order: createSectionDto.order ?? 0
        });

        return await this.sectionsRepository.save(section);
    }

    /**
     * Lấy tất cả sections của một course
     * 
     * @param courseId - Course ID
     * @returns Mảng các sections với lessons
     */
    async findByCourse(courseId: number): Promise<Section[]> {
        return await this.sectionsRepository.find({
            where: { courseId },
            relations: ['lessons'],
            order: { order: 'ASC' }
        });
    }

    /**
     * Lấy section theo ID
     * 
     * @param id - Section ID
     * @returns Section với đầy đủ thông tin
     */
    async findOne(id: number): Promise<Section> {
        const section = await this.sectionsRepository.findOne({
            where: { id },
            relations: ['course', 'lessons']
        });

        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }

        return section;
    }

    /**
     * Cập nhật section
     * 
     * @param id - Section ID
     * @param updateSectionDto - Dữ liệu cập nhật
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Section đã được cập nhật
     * 
     * PERMISSION: Chỉ owner của course hoặc ADMIN
     */
    async update(
        id: number,
        updateSectionDto: UpdateSectionDto,
        userId: number,
        userRole: UserRole
    ): Promise<Section> {
        const section = await this.findOne(id);

        // Kiểm tra quyền: chỉ owner của course hoặc ADMIN
        if (section.course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only update sections in your own courses");
        }

        // Cập nhật
        Object.assign(section, updateSectionDto);
        return await this.sectionsRepository.save(section);
    }

    /**
     * Xóa section
     * 
     * @param id - Section ID
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * 
     * PERMISSION: Chỉ owner của course hoặc ADMIN
     * 
     * NOTE: Khi xóa section, tất cả lessons trong section sẽ bị xóa (CASCADE)
     */
    async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
        const section = await this.findOne(id);

        // Kiểm tra quyền
        if (section.course.instructorId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("You can only delete sections in your own courses");
        }

        await this.sectionsRepository.remove(section);
    }
}
