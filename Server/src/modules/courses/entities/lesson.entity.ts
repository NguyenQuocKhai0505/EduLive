import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Section } from "./section.entity";

/**
 * ENTITY: Lesson
 * 
 * MỤC ĐÍCH: Lưu trữ từng bài học trong section
 * 
 * VÍ DỤ: "Welcome to the course", "Variables and Data Types"
 * 
 * QUAN HỆ:
 * - ManyToOne với Section (nhiều lessons thuộc 1 section)
 */
@Entity("lessons")
export class Lesson extends BaseEntity {
    @Column()
    title: string; // Tên bài học

    @Column({ nullable: true })
    time: string; // Thời lượng "5:00", "10:30"

    // Loại bài học
    @Column({ 
        type: "enum", 
        enum: ["video", "article", "quiz"], 
        default: "video" 
    })
    type: "video" | "article" | "quiz";

    @Column({ default: false })
    preview: boolean; // Bài học có preview miễn phí không

    @Column()
    sectionId: number; // Foreign key đến sections table

    // Quan hệ với Section
    @ManyToOne(() => Section, (section) => section.lessons, { 
        onDelete: "CASCADE" // Khi xóa section → tự động xóa lessons
    })
    @JoinColumn({ name: "sectionId" })
    section: Section; // Relation object

    // Nội dung bài học (tùy loại)
    @Column({ nullable: true })
    videoUrl: string; // URL video nếu type = "video"

    @Column({ type: "text", nullable: true })
    content: string; // Nội dung text nếu type = "article" hoặc "quiz"

    @Column({ default: 0 })
    order: number; // Thứ tự trong section
}