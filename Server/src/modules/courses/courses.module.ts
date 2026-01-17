import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        /**
         * JwtModule
         * 
         * ⚠️ QUAN TRỌNG: Import JwtModule để AuthGuard có thể inject JwtService
         * AuthGuard được sử dụng trong CoursesController cần JwtService để verify token
         */
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as any
                },
            }),
        }),
    ],
        controllers:[CoursesController, CategoriesController, SectionsController, LessonsController],
        providers:[CoursesService, CategoriesService, SectionsService, LessonsService],
        exports:[CoursesService, CategoriesService, SectionsService, LessonsService]
})
export class CoursesModule{}
