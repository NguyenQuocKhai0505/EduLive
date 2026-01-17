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
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { SectionsService } from './sections.service';
import { LessonsService } from './lessons.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';

// TẤT CẢ ROUTES:
//  * - POST   /courses                    - Tạo course mới (TEACHER/ADMIN)
//  * - GET    /courses                    - Lấy tất cả courses đã publish (PUBLIC)
//  * - GET    /courses/:id                 - Lấy course theo ID (PUBLIC)
//  * - GET    /courses/category/:categoryId - Lấy courses theo category (PUBLIC)
//  * - GET    /courses/my/list             - Lấy courses của teacher (TEACHER/ADMIN)
//  * - GET    /courses/pending/approval    - Lấy courses chờ duyệt (ADMIN only)
//  * - PATCH  /courses/:id                 - Cập nhật course (OWNER/ADMIN)
//  * - PATCH  /courses/:id/publish         - Publish/Unpublish course (OWNER/ADMIN)
//  * - PATCH  /courses/:id/approve         - Duyệt course (ADMIN only)
//  * - PATCH  /courses/:id/reject          - Từ chối course (ADMIN only)
//  * - DELETE /courses/:id                 - Xóa course (OWNER/ADMIN)
@Controller("courses")
export class CoursesController{

    constructor(
        private readonly coursesService:CoursesService,
        private readonly sectionsService:SectionsService,
        private readonly lessonsService:LessonsService
    ){}

    //ENDPOINT 1: POST /courses
    @Post()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async create(@Body() createCourseDto:CreateCourseDto, @Req() req:any){
        //@Body: lay du lieu tu request body (JSON)
        //@Req: Lay toan bo request object (de lay user info tu JWT)

        const instructorId = req.user.sub //lay user id tu JWT payload 
        const userRole = req.user.role

        //Goi service de xu li logic business logic
        return await this.coursesService.create(createCourseDto,instructorId,userRole)
    }
    //ENDPOINT 2: GET /courses
    @Get()
    async findAll(
        @Query("categoryId") categoryId?:string, //Lay query tu parameter
        @Query("level") level?:string,
        @Query("language") language?:string,
    ){
        //Neu co categoryId, lay course theo category
        if(categoryId){
            return await this.coursesService.findByCategory(parseInt(categoryId))
        }
        //Neu khong lay tat ca cac category da publish
        return await this.coursesService.findAll()
    }
    //ENDPOINT 3: GET /courses/pending/approval
    @Get('pending/approval')  
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) 
    async getPendingCourses() {
        return await this.coursesService.findPendingApproval();
    }

    //ENDPOINT 4: GET /courses/my/list
    @Get("my/list")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    async getMyCourse(@Req() req:any){
        const instructorId= req.user.sub //lay id cua teacher tu JWT
        return await this.coursesService.findByInstructor(instructorId)
    }

    //END POINT 5: GET /courses/category/:categoryId
    @Get("category/:categoryId")
    async findByCategory(@Param("categoryId",ParseIntPipe)categoryId:number){
        //@Params(): lay parameter tu URL
        return await this.coursesService.findByCategory(categoryId)
    }

    // ============================================
    // NESTED ROUTES: SECTIONS & LESSONS
    // ⚠️ QUAN TRỌNG: Phải đặt TRƯỚC route /courses/:id
    // để tránh conflict (NestJS match routes theo thứ tự)
    // ============================================

    /**
     * POST /courses/:courseId/sections
     * 
     * Tạo section mới trong course
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Post(":courseId/sections")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async createSection(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Body() createSectionDto: Omit<CreateSectionDto, 'courseId'>,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        // Tự động set courseId từ URL param
        return await this.sectionsService.create(
            { ...createSectionDto, courseId },
            userId,
            userRole
        );
    }

    /**
     * GET /courses/:courseId/sections
     * 
     * Lấy tất cả sections của course
     * 
     * PERMISSION: PUBLIC
     */
    @Get(":courseId/sections")
    async getSectionsByCourse(@Param("courseId", ParseIntPipe) courseId: number) {
        return await this.sectionsService.findByCourse(courseId);
    }

    /**
     * GET /courses/:courseId/sections/:sectionId
     * 
     * Lấy section chi tiết
     * 
     * PERMISSION: PUBLIC
     */
    @Get(":courseId/sections/:sectionId")
    async getSectionById(
        @Param("sectionId", ParseIntPipe) sectionId: number
    ) {
        return await this.sectionsService.findOne(sectionId);
    }

    /**
     * POST /courses/:courseId/sections/:sectionId/lessons
     * 
     * Tạo lesson mới trong section
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Post(":courseId/sections/:sectionId/lessons")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async createLesson(
        @Param("sectionId", ParseIntPipe) sectionId: number,
        @Body() createLessonDto: Omit<CreateLessonDto, 'sectionId'>,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        // Tự động set sectionId từ URL param
        return await this.lessonsService.create(
            { ...createLessonDto, sectionId },
            userId,
            userRole
        );
    }

    /**
     * GET /courses/:courseId/sections/:sectionId/lessons
     * 
     * Lấy tất cả lessons của section
     * 
     * PERMISSION: PUBLIC
     */
    @Get(":courseId/sections/:sectionId/lessons")
    async getLessonsBySection(@Param("sectionId", ParseIntPipe) sectionId: number) {
        return await this.lessonsService.findBySection(sectionId);
    }

    /**
     * GET /courses/:courseId/sections/:sectionId/lessons/:lessonId
     * 
     * Lấy lesson chi tiết
     * 
     * PERMISSION: PUBLIC
     */
    @Get(":courseId/sections/:sectionId/lessons/:lessonId")
    async getLessonById(
        @Param("lessonId", ParseIntPipe) lessonId: number
    ) {
        return await this.lessonsService.findOne(lessonId);
    }

    /**
     * PATCH /courses/:courseId/sections/:sectionId
     * 
     * Cập nhật section
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Patch(":courseId/sections/:sectionId")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async updateSection(
        @Param("sectionId", ParseIntPipe) sectionId: number,
        @Body() updateSectionDto: UpdateSectionDto,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.sectionsService.update(sectionId, updateSectionDto, userId, userRole);
    }

    /**
     * DELETE /courses/:courseId/sections/:sectionId
     * 
     * Xóa section
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Delete(":courseId/sections/:sectionId")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteSection(
        @Param("sectionId", ParseIntPipe) sectionId: number,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        await this.sectionsService.remove(sectionId, userId, userRole);
    }

    /**
     * PATCH /courses/:courseId/sections/:sectionId/lessons/:lessonId
     * 
     * Cập nhật lesson
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Patch(":courseId/sections/:sectionId/lessons/:lessonId")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async updateLesson(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() updateLessonDto: UpdateLessonDto,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        return await this.lessonsService.update(lessonId, updateLessonDto, userId, userRole);
    }

    /**
     * DELETE /courses/:courseId/sections/:sectionId/lessons/:lessonId
     * 
     * Xóa lesson
     * 
     * PERMISSION: TEACHER (owner) hoặc ADMIN
     */
    @Delete(":courseId/sections/:sectionId/lessons/:lessonId")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteLesson(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const userRole = req.user.role;
        await this.lessonsService.remove(lessonId, userId, userRole);
    }

    //ENDPOINT 6: GET /courses/:id
    // ⚠️ QUAN TRỌNG: Route này phải đặt SAU các nested routes
    @Get(":id") 
    async findOne(@Param("id",ParseIntPipe)id:number){
        return await this.coursesService.findOne(id)
    }

    //ENDPOINT 7: PATCH courses/:id
    //Cap nhat course
    @Patch(":id")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    async update(
        @Param("id",ParseIntPipe) id:number,
        @Body() updateCourseDto: UpdateCourseDto,
        @Req() req:any,
    ){
        const userId = req.user.sub
        const userRole = req.user.role
        return await this.coursesService.update(id,updateCourseDto,userId,userRole)
    }

    //ENDPOINT 8: /courses/:id/publish
    //Toggle Publish Courses

    @Patch(":id/publish")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    async togglePublish(@Param("id",ParseIntPipe) id:number, @Req() req:any){
        const userId = req.user.sub
        const userRole = req.user.role
        return await this.coursesService.togglePublish(id,userId,userRole)
    }

    //ENDPOINT 9: PATCH /courses/:id/approve
    //Duyet khoa hoc
    @Patch(":id/approve")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    async approveCourse(@Param("id",ParseIntPipe) id:number, @Req() req:any){
        const userRole = req.user.role  // ⚠️ FIX: Phải là req.user.role, không phải req.user.sub
        return await this.coursesService.approveCourse(id,userRole)
    }

    //ENDPOINT 10: PATCH/ courses/:id/reject
    @Patch(":id/reject")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async rejectCourse(
        @Param("id",ParseIntPipe) id:number,
        @Req() req:any,
        @Body() body:{reason?:string}
    ){
        const userRole = req.user.role
        return await this.coursesService.rejectCourse(id,userRole,body.reason)
    }

    //ENDPOINT 11: DELETE /courses/:id
    @Delete(":id")  // ⚠️ FIX: Không cần dấu / vì đã có trong base path
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN,UserRole.TEACHER)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param("id",ParseIntPipe) id: number,
        @Req() req:any
    ){
        const userId = req.user.sub
        const userRole = req.user.role
        await this.coursesService.delete(id,userId,userRole)  // ⚠️ FIX: Không cần return vì đã set NO_CONTENT
    }

}