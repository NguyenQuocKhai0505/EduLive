import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Course } from "./course.entity";
import { Lesson } from "./lesson.entity";

@Entity("sections")
/**
 * ENTITY: Section
 * 
 * MỤC ĐÍCH: Lưu trữ các chương/phần của khóa học
 * 
 * VÍ DỤ: "Section 1: Introduction", "Section 2: Basic Concepts"
 * 
 * QUAN HỆ:
 * - ManyToOne với Course (nhiều sections thuộc 1 course)
 * - OneToMany với Lesson (1 section có nhiều lessons)
 */
export class Section extends BaseEntity {
    @Column()
    title: string;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, (course) => course.sections, { onDelete: "CASCADE" })
    @JoinColumn({ name: "courseId" })
    course: Course;

    @OneToMany(() => Lesson, (lesson) => lesson.section, { cascade: true })
    lessons: Lesson[];

    @Column({ default: 0 })
    order: number; // Thứ tự hiển thị
}