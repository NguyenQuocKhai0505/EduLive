import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
    BadRequestException,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decirator';
import { UserRole } from '../users/enums/user-role.enum';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { imageFileFilter } from '../../common/utils/file-upload.util';

/**
 * CONTROLLER: CategoriesController
 * 
 * MỤC ĐÍCH: Xử lý HTTP requests/responses cho categories
 * 
 * BASE PATH: /categories
 * 
 * ENDPOINTS:
 * - POST   /categories           - Tạo category mới (ADMIN only)
 * - GET    /categories           - Lấy tất cả categories (PUBLIC)
 * - GET    /categories/:id        - Lấy category theo ID (PUBLIC)
 * - GET    /categories/slug/:slug - Lấy category theo slug (PUBLIC)
 * - PATCH  /categories/:id        - Cập nhật category (ADMIN only)
 * - DELETE /categories/:id        - Xóa category (ADMIN only)
 */
@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    /**
     * POST /categories
     * 
     * Tạo category mới
     * 
     * PERMISSION: ADMIN only
     */
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return await this.categoriesService.create(createCategoryDto);
    }

    /**
     * GET /categories
     * 
     * Lấy tất cả categories
     * 
     * PERMISSION: PUBLIC
     * 
     * QUERY PARAMS:
     * - includeInactive: true/false - Có lấy categories không active không
     */
    @Get()
    async findAll(@Query('includeInactive') includeInactive?: string) {
        const include = includeInactive === 'true';
        return await this.categoriesService.findAll(include);
    }

    /**image.png
     * GET /categories/:id
     * 
     * Lấy category theo ID
     * 
     * PERMISSION: PUBLIC
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.categoriesService.findOne(id);
    }

    /**
     * GET /categories/slug/:slug
     * 
     * Lấy category theo slug
     * 
     * PERMISSION: PUBLIC
     */
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return await this.categoriesService.findBySlug(slug);
    }

    /**
     * PATCH /categories/:id
     * 
     * Cập nhật category
     * 
     * PERMISSION: ADMIN only
     */
    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        return await this.categoriesService.update(id, updateCategoryDto);
    }

    /**
     * POST /categories/:id/image
     *
     * Upload image lên Cloudinary và cập nhật category
     *
     * PERMISSION: ADMIN only
     */
    @Post(':id/image')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 },
        })
    )
    async uploadCategoryImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        const url = await this.cloudinaryService.uploadImage(file, 'categories');
        const category = await this.categoriesService.update(id, { image: url });
        return { image: url, category };
    }

    /**
     * DELETE /categories/:id
     * 
     * Xóa category (soft delete - set isActive = false)
     * 
     * PERMISSION: ADMIN only
     */
    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.categoriesService.remove(id);
    }
}
