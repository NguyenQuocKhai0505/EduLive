import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { LessonCompletion } from './entities/lesson-completion.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../courses/entities/lesson.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CartStatus } from '../cart/enums/cart-status.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LessonCompletion)
    private readonly completionRepo: Repository<LessonCompletion>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
  ) {}

  async ensureUserCanAccessCourse(userId: number, courseId: number): Promise<void> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, isActive: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const enrolled = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (enrolled) return;

    const purchased = await this.cartRepo.findOne({
      where: { userId, courseId, status: CartStatus.PURCHASED },
    });
    if (purchased) return;

    throw new ForbiddenException('You do not have access to this course');
  }

  async enroll(userId: number, courseId: number) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, isPublished: true, isActive: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const existed = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (existed) throw new BadRequestException('Aldready enrolled');

    return this.enrollmentRepo.save({ userId, courseId });
  }

  async getMyCourses(userId: number) {
    const enrollments = await this.enrollmentRepo.find({
      where: { userId },
      relations: ['course', 'course.instructor', 'course.category'],
      order: { createdAt: 'DESC' },
    });
    return enrollments.map((e) => e.course);
  }

  async getLessonProgress(
    userId: number,
    courseId: number,
  ): Promise<{ completedLessonIds: number[] }> {
    await this.ensureUserCanAccessCourse(userId, courseId);
    const rows = await this.completionRepo.find({
      where: { userId, courseId },
      select: ['lessonId'],
    });
    return { completedLessonIds: rows.map((r) => r.lessonId) };
  }

  async markLessonComplete(
    userId: number,
    courseId: number,
    lessonId: number,
  ): Promise<{ ok: boolean }> {
    await this.ensureUserCanAccessCourse(userId, courseId);

    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['section'],
    });
    if (!lesson || !lesson.section || lesson.section.courseId !== courseId) {
      throw new BadRequestException('Lesson does not belong to this course');
    }

    const existing = await this.completionRepo.findOne({
      where: { userId, lessonId },
    });
    if (!existing) {
      await this.completionRepo.save({
        userId,
        courseId,
        lessonId,
      });
    }
    return { ok: true };
  }
}
