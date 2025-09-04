import { HttpException, Injectable, Logger } from '@nestjs/common';
import { User, UpdateUser } from './type/user.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name, { timestamp: true });
  constructor(private prisma: PrismaService) {}
  create(createUserDto: User) {
    return 'This action adds a new user';
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error: any) {
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
