// src/modules/youtube-courses/youtube-courses.service.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { YoutubeCourse } from "./entities/youtube-course.entity";
import { CreateYoutubeCourseDto } from "./dto/create-youtube-course.dto";
import { UpdateYoutubeCourseDto } from "./dto/update-youtube-course.dto";

@Injectable()
export class YoutubeCoursesService {
  constructor(
    @InjectRepository(YoutubeCourse)
    private readonly repo: Repository<YoutubeCourse>,
  ) {}

  create(dto: CreateYoutubeCourseDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Public: render list free course
  findAll() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, dto: UpdateYoutubeCourseDto) {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException("YouTube course not found");
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException("YouTube course not found");
    await this.repo.remove(existing);
    return { success: true };
  }

  /**
   * Lấy metadata từ YouTube URL (title, thumbnail, author)
   * Sử dụng YouTube oEmbed API (không cần API key)
   */
  async fetchMetadataFromUrl(youtubeUrl: string) {
    try {
      // Extract video ID từ URL
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new BadRequestException("Invalid YouTube URL");
      }

      // Gọi YouTube oEmbed API
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
      const response = await axios.get(oEmbedUrl);

      const data = response.data;

      return {
        title: data.title || "",
        author: data.author_name || "",
        thumbnailUrl: data.thumbnail_url || "",
        videoId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          "Không thể lấy thông tin từ YouTube URL. Vui lòng kiểm tra lại URL."
        );
      }
      throw error;
    }
  }

  /**
   * Extract video ID từ các dạng YouTube URL
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}