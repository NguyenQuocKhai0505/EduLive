import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService{
        
    constructor(@InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ){}
    //CREATE USER
    async create(createUserDto:CreateUserDto):Promise<User>{
        //WORK FLOW 1: BUSINESS LOGIC
        const existingUser = await this.usersRepository.findOne({
            where: {email: createUserDto.email}
        })
        if(existingUser){
            throw new ConflictException("Email is aldready used")
        }
        //WORKFLOW2: SECURITY
        //SALT 10 ROUND 
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password,salt)

        //WORKFLOW3: INSTANCE USER 
        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword
        })
        //WORKFLOW4: SAVE DATABASE 
        try{
            return this.usersRepository.save(newUser)
        }catch(error){
            throw new BadRequestException("Cannot create USER right now")
        }
    }
    //FIND ALL USER
    async findAll():Promise<User[]>{
        return this.usersRepository.find()
    }
    //FIND USER BY ID
    async findOne(id: number): Promise<User | null> { 
        return this.usersRepository.findOneBy({ id });
    }
    //FIND USER BY EMAIL 
    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ 
          where: { email } 
        });
    }
}