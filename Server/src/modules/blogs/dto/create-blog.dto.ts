import { 
    IsNotEmpty, 
    IsString, 
    IsOptional, 
    IsArray 
} from 'class-validator';


export class CreateBlogDto{
    @IsNotEmpty({message:"Title cannot be left blank"})
    @IsString()
    title:string

    @IsNotEmpty({message:"Content cannot be left blank"})
    @IsString()
    content:string

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    tags?:string[]
}