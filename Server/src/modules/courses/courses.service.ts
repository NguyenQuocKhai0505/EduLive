import { 
    Injectable, 
    NotFoundException, 
    ForbiddenException, 
    BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Category } from './entities/category.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { MoreThanOrEqual, LessThanOrEqual, Like, IsNull, Not, In } from 'typeorm';
import { FilterCourseDto } from './dto/filter-course.dto';
/**
 * SERVICE: CoursesService
 * 
 * MỤC ĐÍCH: Xử lý business logic cho courses
 * 
 * RESPONSIBILITIES:
 * - CRUD operations cho courses
 * - Kiểm tra quyền (owner, ADMIN)
 * - Validate dữ liệu
 */
@Injectable()
export class CoursesService{
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ){}

     /**
     * Tạo khóa học mới
     * 
     * @param createCourseDto - Dữ liệu khóa học
     * @param instructorId - ID của user tạo (từ JWT)
     * @param userRole - Role của user (từ JWT)
     * @returns Course mới được tạo
     * 
     * VALIDATION:
     * - Chỉ TEACHER hoặc ADMIN được tạo
     * - Category phải tồn tại và active
     */
    async create(
        createCourseDto: CreateCourseDto,
        instructorId: number,
        userRole:UserRole
    ):Promise<Course>{
        //1. Kiem tra quyen 
        if(userRole !== UserRole.TEACHER && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("Only TEACHER and ADMIN can create courses ")
        }
        //2.Kiem tra category co ton tai hay khong 
        const category = await this.categoryRepository.findOne({
            where:{id:createCourseDto.categoryId, isActive:true}
        })
        
        if(!category){
            throw new NotFoundException(`Category with ID ${createCourseDto.categoryId} not found or inactive`)
        }
        //3. Tao course moi 
        const course = this.courseRepository.create({
            ...createCourseDto,
            instructorId,
            isPublished:false,
            isActive:false,
            price: createCourseDto.price ||0,
            students:0,
            rating: createCourseDto.rating || 0,
            lectures:0
        })
        //4: Luu vao database 
        return this.courseRepository.save(course)
    }
    
    /**
     * Lấy tất cả khóa học (chỉ published và active)
     * 
     * @returns Mảng các courses
     */
    async findAll():Promise<Course[]>{
        return await this.courseRepository.find({
            where:{
                isPublished:true,
                isActive: true

            },
            relations:["instructor","category"], //Lay thong tin instructor va category
            order: { createdAt: 'DESC' },
        })
    }

    /**
     * Lấy khóa học theo ID
     * 
     * @param id - Course ID
     * @returns Course với đầy đủ thông tin
     */

    async findOne(id: number): Promise<Course> {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: [
                'instructor',      // Thông tin teacher
                'category',        // Thông tin category
                'sections',        // Các chương học
                'sections.lessons' // Các bài học trong mỗi chương
            ],
        });
        if(!course){
            throw new NotFoundException(`Course with ID ${id} not found`)
        }
        return course
    }

      /**
     * Cập nhật khóa học
     * 
     * @param id - Course ID
     * @param updateCourseDto - Dữ liệu cập nhật
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Course đã được cập nhật
     * 
     * PERMISSION:
     * - Chỉ owner (instructor) hoặc ADMIN được update
     */
    async update(id:number, updateCourseDto:UpdateCourseDto, userId: number, userRole: UserRole):Promise<Course>{
        const course = await this.findOne(id); // Kiểm tra course tồn tại

        //Kiem tra quyen: Chi OWMER VA ADMIN moi co the sua 
        if(course.instructorId !== userId && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("You can only update your own course")
        }

         //Neu co categoryId moi, kiem tra category ton tai
         if(updateCourseDto.categoryId){
            const category = await this.categoryRepository.findOne({
                where: {id:updateCourseDto.categoryId, isActive:true}
            })
            if(!category){
                throw new NotFoundException("Category cannot found ")
            }
         }
         //Cap nhat 
         Object.assign(course,updateCourseDto)
         return await this.courseRepository.save(course)
    }
    
    /**
     * Xóa khóa học
     * 
     * @param id - Course ID
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * 
     * PERMISSION:
     * - Chỉ owner hoặc ADMIN được xóa
     */
    async delete(id:number,userId: number, userRole:UserRole):Promise<void>{
        //Tim course 
        const deletedCourse =  await this.findOne(id)

        //Kiem tra quyen OWMER va TEACHER 

        if(deletedCourse.instructorId !== userId && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("You can only delete your courses")
        }
        await this.courseRepository.remove(deletedCourse)
    }

      /**
     * Publish/Unpublish khóa học
     * 
     * @param id - Course ID
     * @param userId - ID của user đang thực hiện
     * @param userRole - Role của user
     * @returns Course đã được cập nhật
     */
    async togglePublish(id:number, userId: number, userRole:UserRole):Promise<Course>{
        const course = await this.findOne(id)

        //Kiem tra quyen
        if(course.instructorId !== userId && userRole !== UserRole.ADMIN){
            throw new ForbiddenException("You can only publish/unpublish your own courses")
        }
        //Chi duoc publish course neu da duoc duyet (isActive=true)
        if(!course.isActive){
            throw new BadRequestException("Course must be approved by admin before it can be published")
        }
        //Toggle publish status
        course.isPublished = !course.isPublished
        return await this.courseRepository.save(course)
    }

    /**
     * Duyệt khóa học (chỉ ADMIN)
     * 
     * @param id - Course ID
     * @param userRole - Role của user (phải là ADMIN)
     * @returns Course đã được duyệt
     */
    async approveCourse(id:number,userRole:UserRole):Promise<Course>{
        //Kiem tra quyen: Chi ADMIN
        if(userRole !== UserRole.ADMIN){
            throw new ForbiddenException("Only admins can approve courses")
        }
        const course = await this.findOne(id)

        //Kiem tra course da duoc duyet hay chua (isActive=true)
        if(course.isActive){
            throw new BadRequestException("Course is aldready approved")
        }
        //Duyet course 
        course.isActive = true
        return await this.courseRepository.save(course)
    }

    /**
     * Từ chối khóa học (chỉ ADMIN)
     * 
     * @param id - Course ID
     * @param userRole - Role của user (phải là ADMIN)
     * @param reason - Lý do từ chối (optional)
     * @returns Course đã bị từ chối
     */
    async rejectCourse(id: number, userRole: UserRole, reason?: string): Promise<Course> {
        if (userRole !== UserRole.ADMIN) {
            throw new ForbiddenException("Only admins can reject courses");
        }
    
        const course = await this.findOne(id);
    
        if (!course.isActive) {
            // Có thể xóa luôn hoặc giữ lại với isActive = false
            // Ở đây giữ lại để teacher có thể sửa và gửi lại
            course.isActive = false;
            // Có thể thêm field rejectionReason vào Course entity nếu cần
        }
    
        return await this.courseRepository.save(course);
    }
    /**
     * Lấy danh sách courses chờ duyệt (chỉ ADMIN)
     * 
     * @returns Mảng courses chờ duyệt
     */
    async findPendingApproval(): Promise<Course[]> {
        return await this.courseRepository.find({
            where: { 
                isActive: false // Chưa được duyệt
            },
            relations: ['instructor', 'category', 'sections', 'sections.lessons'],
            order: { createdAt: 'ASC' }, // Cũ nhất trước (để duyệt theo thứ tự)
        });
    }

    /**
     * Lấy danh sách courses theo instructor
     * 
     * @param instructorId - ID của instructor
     * @returns Mảng courses của instructor
     */
    async findByInstructor(instructorId: number): Promise<Course[]> {
        return await this.courseRepository.find({
            where: { instructorId },
            relations: ['instructor', 'category'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Lấy danh sách courses theo category
     * 
     * @param categoryId - ID của category
     * @returns Mảng courses trong category (chỉ published và active)
     */
    async findByCategory(categoryId: number): Promise<Course[]> {
        return await this.courseRepository.find({
            where: {
                categoryId,
                isPublished: true,
                isActive: true,
            },
            relations: ['instructor', 'category'],
            order: { createdAt: 'DESC' },
        });
    }

    //FILTER COURSES WITH CONDITIONS
    async findFiltered(filterDto:FilterCourseDto):Promise<Course[]>{
        //Query builder 
        const queryBuilder = this.courseRepository.createQueryBuilder("course")
        .leftJoinAndSelect("course.instructor", "instructor")
        .leftJoinAndSelect("course.category","category")
        .where("course.isPublished = :isPublished", { isPublished: true })
        .andWhere("course.isActive = :isActive", { isActive: true })

        //Filter by category
        if(filterDto.categoryId){
            queryBuilder.andWhere("course.categoryId= :categoryId", { categoryId: filterDto.categoryId })
        }
        //Filter by level 
        if(filterDto.level && filterDto.level !== "All Levels"){
            queryBuilder.andWhere("course.level= :level",{level:filterDto.level})
        }

        //Filter by language 
        if(filterDto.language){
            queryBuilder.andWhere("course.language= :language",{language:filterDto.language})
        }

        //Filter by rating
        if(filterDto.minRating !== undefined){
            queryBuilder.andWhere("course.rating >= :minRating",{minRating:filterDto.minRating})
        }

        //Filter by price 
        if(filterDto.minPrice !== undefined){
            queryBuilder.andWhere("course.price >= :minPrice",{minPrice:filterDto.minPrice})
        }

        if(filterDto.maxPrice !== undefined){
            queryBuilder.andWhere("course.price <= :maxPrice",{maxPrice:filterDto.maxPrice})
        }

        //Filter by price type 
        if(filterDto.price ==="Free"){
            queryBuilder.andWhere("course.price = :freePrice",{freePrice:0})
        }else if (filterDto.price === "Paid"){
            queryBuilder.andWhere("course.price > :paidPrice",{paidPrice:0})
        }

        //Filter theo duration ranges
        if (filterDto.duration) {
            switch (filterDto.duration) {
            case 'short':
                queryBuilder.andWhere('course.duration >= :durationMin AND course.duration < :durationMax', {
                durationMin: 0,
                durationMax: 1
                });
                break;
            case 'medium':
                queryBuilder.andWhere('course.duration >= :durationMin AND course.duration < :durationMax', {
                durationMin: 1,
                durationMax: 3
                });
                break;
            case 'long':
                queryBuilder.andWhere('course.duration >= :durationMin AND course.duration < :durationMax', {
                durationMin: 3,
                durationMax: 6
                });
                break;
            case 'extra-long':
                queryBuilder.andWhere('course.duration >= :durationMin', {
                durationMin: 6
                });
                break;
            }
        }

        //Search by title 
        if(filterDto.title){
            queryBuilder.andWhere("course.title LIKE :title",{title:`%${filterDto.title}%`})
        }
        //ilter theo "has video" - cần join với sections và lessons
        if (filterDto.video === true) {
            queryBuilder
            .leftJoin('course.sections', 'section')
            .leftJoin('section.lessons', 'lesson')
            .andWhere('lesson.type = :lessonType', { lessonType: 'video' })
            .groupBy('course.id'); // Group by để tránh duplicate khi có nhiều lessons
        }

        //Order by createdAt (mới nhất trước)
        queryBuilder.orderBy('course.createdAt', 'DESC');

        //Execute query
        return await queryBuilder.getMany();
    }
}