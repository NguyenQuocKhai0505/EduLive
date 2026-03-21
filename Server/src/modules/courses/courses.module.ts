import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Course } from './entities/course.entity';
import { Category } from './entities/category.entity';
import { Section } from './entities/section.entity';
import { Lesson } from './entities/lesson.entity';
import { UsersModule } from '../users/users.module';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    // IMPORTS: Import cac module khac 
    //Muc dich su dung provider va entity tu cac module khac 
    imports:[
        TypeOrmModule.forFeature([
            Course,
            Category,
            Section,
            Lesson
        ]),
        /**
         * UsersModule
         * 
         * Import de su dung User Entity trong relationships
         * Course co relationship ManytoOne voi User
         */
        UsersModule,
        AuthModule,
    ],
        controllers:[CoursesController, CategoriesController, SectionsController, LessonsController],
        providers:[CoursesService, CategoriesService, SectionsService, LessonsService, CloudinaryService],
        exports:[CoursesService, CategoriesService, SectionsService, LessonsService]
})
export class CoursesModule{}
