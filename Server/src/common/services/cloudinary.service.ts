import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        // Cấu hình Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    /**
     * Upload một file lên Cloudinary
     * @param file File object từ Multer
     * @param folder Folder trong Cloudinary (ví dụ: 'blogs', 'comments')
     * @returns Promise với URL của ảnh đã upload
     */
    async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Tạo stream từ buffer của file
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder, // Lưu vào folder trong Cloudinary
                    resource_type: 'image',
                    // Bỏ format: 'auto' vì có thể gây lỗi với một số file types
                    // Cloudinary sẽ tự động detect format từ file extension
                    quality: 'auto', // Tự động optimize quality
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (!result || !result.secure_url) {
                        // Kiểm tra result có tồn tại và có secure_url không
                        reject(new Error('Upload failed: No result or secure_url from Cloudinary'));
                    } else {
                        // Trả về secure_url (HTTPS)
                        resolve(result.secure_url);
                    }
                }
            );

            // Pipe buffer vào upload stream
            uploadStream.end(file.buffer);
        });
    }

    /**
     * Upload nhiều files lên Cloudinary
     * @param files Array of files từ Multer
     * @param folder Folder trong Cloudinary
     * @returns Promise với array of URLs
     */
    async uploadMultipleImages(
        files: Express.Multer.File[],
        folder: string
    ): Promise<string[]> {
        const uploadPromises = files.map((file) => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Xóa ảnh khỏi Cloudinary bằng URL
     * @param imageUrl URL của ảnh cần xóa
     */
    async deleteImage(imageUrl: string): Promise<void> {
        try {
            // Extract public_id từ URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
            const urlParts = imageUrl.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
                const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
                
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            // Không throw error để không ảnh hưởng đến flow chính
        }
    }
}
