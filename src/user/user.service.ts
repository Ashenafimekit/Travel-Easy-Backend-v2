import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUser, UpdateUser } from './type/user.type';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name, { timestamp: true });
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUser) {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (existedUser) {
      throw new Error('User already exists');
    }
    if (!createUserDto.password) {
      throw new Error('Password is required');
    }
    createUserDto.password = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });
      return user;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const users = await 
    } catch (error : any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUser) {
    this.logger.log(`Updating user with id: ${id}`, updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
