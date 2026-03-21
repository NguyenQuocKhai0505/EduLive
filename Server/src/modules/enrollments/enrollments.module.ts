import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Enrollment } from "./entities/enrollment.entity";
import { LessonCompletion } from "./entities/lesson-completion.entity";
import { Course } from "../courses/entities/course.entity";
import { Lesson } from "../courses/entities/lesson.entity";
import { CartItem } from "../cart/entities/cart-item.entity";
import { EnrollmentsService } from "./enrollments.service";
import { EnrollmentsController } from "./enrollments.controller";
import { AuthModule } from "../auth/auth.module"; // Import AuthModule để sử dụng JwtService cho AuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      LessonCompletion,
      Course,
      Lesson,
      CartItem,
    ]),
    AuthModule, // Import AuthModule để có JwtModule (cần cho AuthGuard)
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService]
})
export class EnrollmentsModule {}