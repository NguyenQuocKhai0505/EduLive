import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService{
        
    constructor(@InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ){}
    
    /**
     * Tạo user mới (PUBLIC REGISTRATION)
     * 
     * ⚠️ BẢO MẬT: Chỉ cho phép đăng ký với role STUDENT
     * ADMIN và TEACHER chỉ có thể được tạo bởi ADMIN qua endpoint riêng
     * 
     * @param createUserDto - Dữ liệu user
     * @returns User mới được tạo (luôn có role = STUDENT)
     */
    async create(createUserDto:CreateUserDto):Promise<User>{
        //WORK FLOW 1: BUSINESS LOGIC
        const existingUser = await this.usersRepository.findOne({
            where: {email: createUserDto.email}
        })
        if(existingUser){
            throw new ConflictException("Email is aldready used")
        }
        
        // ⚠️ BẢO MẬT: Force role = STUDENT cho public registration
        // Không cho phép user tự set role ADMIN hoặc TEACHER
        if (createUserDto.role && 
            (createUserDto.role === UserRole.ADMIN || createUserDto.role === UserRole.TEACHER)) {
            throw new ForbiddenException("You cannot register with admin or teacher role. Please contact administrator.");
        }
        
        //WORKFLOW2: SECURITY
        // Chỉ hash password nếu có password (không phải social login)
        let hashedPassword = createUserDto.password;
        if (createUserDto.password && createUserDto.password.trim() !== '') {
            //SALT 10 ROUND 
            const salt = await bcrypt.genSalt()
            hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        }

        //WORKFLOW3: INSTANCE USER 
        // Force role = STUDENT (bỏ qua role từ DTO nếu có)
        const newUser = this.usersRepository.create({
            ...createUserDto,
            role: UserRole.STUDENT, // ⚠️ QUAN TRỌNG: Luôn set role = STUDENT
            password: hashedPassword
        })
        //WORKFLOW4: SAVE DATABASE 
        try{
            return this.usersRepository.save(newUser)
        }catch(error){
            throw new BadRequestException("Cannot create USER right now")
        }
    }
    
    /**
     * Tạo user với role cụ thể (CHỈ ADMIN)
     * 
     * Endpoint này chỉ dành cho ADMIN để tạo TEACHER hoặc ADMIN khác
     * 
     * @param createUserDto - Dữ liệu user (có thể có role ADMIN hoặc TEACHER)
     * @returns User mới được tạo
     */
    async createWithRole(createUserDto: CreateUserDto): Promise<User> {
        // Kiểm tra email đã tồn tại
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email }
        });
        
        if (existingUser) {
            throw new ConflictException("Email is already used");
        }
        
        // Hash password nếu có
        let hashedPassword = createUserDto.password;
        if (createUserDto.password && createUserDto.password.trim() !== '') {
            const salt = await bcrypt.genSalt();
            hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        }
        
        // Tạo user với role từ DTO (có thể là ADMIN hoặc TEACHER)
        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || UserRole.STUDENT // Mặc định STUDENT nếu không có
        });
        
        try {
            return await this.usersRepository.save(newUser);
        } catch (error) {
            throw new BadRequestException("Cannot create USER right now");
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
    //UPDATE USER
    async update(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new BadRequestException("User not found");
        }
        Object.assign(user, updateData);
        return this.usersRepository.save(user);
    }
}