import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * SERVICE: CategoriesService
 * 
 * MỤC ĐÍCH: Xử lý business logic cho categories
 * 
 * RESPONSIBILITIES:
 * - CRUD operations cho categories
 * - Validate dữ liệu (unique name, slug)
 */
@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    /**
     * Tạo category mới
     * 
     * @param createCategoryDto - Dữ liệu category
     * @returns Category mới được tạo
     * 
     * VALIDATION:
     * - Name phải unique
     * - Slug phải unique (nếu có)
     */
    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        // Kiểm tra name đã tồn tại chưa
        const existingCategory = await this.categoriesRepository.findOne({
            where: { name: createCategoryDto.name }
        });

        if (existingCategory) {
            throw new ConflictException(`Category "${createCategoryDto.name}" already exists`);
        }

        // Tạo slug từ name nếu không có
        const slug = createCategoryDto.slug || 
            createCategoryDto.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

        // Kiểm tra slug đã tồn tại chưa
        const existingSlug = await this.categoriesRepository.findOne({
            where: { slug }
        });

        if (existingSlug) {
            throw new ConflictException(`Slug "${slug}" already exists`);
        }

        // Tạo category mới
        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            slug,
            isActive: createCategoryDto.isActive ?? true, // Mặc định là active
            courseCount: 0
        });

        return await this.categoriesRepository.save(category);
    }

    /**
     * Lấy tất cả categories
     * 
     * @param includeInactive - Có lấy categories không active không
     * @returns Mảng các categories
     */
    async findAll(includeInactive: boolean = false): Promise<Category[]> {
        const where: any = {};
        
        if (!includeInactive) {
            where.isActive = true;
        }

        return await this.categoriesRepository.find({
            where,
            order: { name: 'ASC' },
        });
    }

    /**
     * Lấy category theo ID
     * 
     * @param id - Category ID
     * @returns Category với đầy đủ thông tin
     */
    async findOne(id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['courses'] // Load courses trong category
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    /**
     * Lấy category theo slug
     * 
     * @param slug - Category slug
     * @returns Category với đầy đủ thông tin
     */
    async findBySlug(slug: string): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { slug },
            relations: ['courses']
        });

        if (!category) {
            throw new NotFoundException(`Category with slug "${slug}" not found`);
        }

        return category;
    }

    /**
     * Cập nhật category
     * 
     * @param id - Category ID
     * @param updateCategoryDto - Dữ liệu cập nhật
     * @returns Category đã được cập nhật
     */
    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        // Nếu có name mới, kiểm tra unique
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existingCategory = await this.categoriesRepository.findOne({
                where: { name: updateCategoryDto.name }
            });

            if (existingCategory) {
                throw new ConflictException(`Category "${updateCategoryDto.name}" already exists`);
            }
        }

        // Nếu có slug mới, kiểm tra unique
        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingSlug = await this.categoriesRepository.findOne({
                where: { slug: updateCategoryDto.slug }
            });

            if (existingSlug) {
                throw new ConflictException(`Slug "${updateCategoryDto.slug}" already exists`);
            }
        }

        // Cập nhật
        Object.assign(category, updateCategoryDto);
        return await this.categoriesRepository.save(category);
    }

    /**
     * Xóa category (soft delete - set isActive = false)
     * 
     * @param id - Category ID
     * @returns Category đã bị xóa
     */
    async remove(id: number): Promise<Category> {
        const category = await this.findOne(id);
        
        // Soft delete: set isActive = false
        category.isActive = false;
        return await this.categoriesRepository.save(category);
    }

    /**
     * Xóa category vĩnh viễn (hard delete)
     * 
     * @param id - Category ID
     * 
     * LƯU Ý: Chỉ dùng khi chắc chắn category không có courses nào
     */
    async hardDelete(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.categoriesRepository.remove(category);
    }
}
