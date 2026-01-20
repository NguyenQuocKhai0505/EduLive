import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';

//Partial Type: change all fields from CreateBlogDto to optional
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
