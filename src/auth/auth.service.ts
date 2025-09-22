import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/type/user.type';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone: phone },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          password: true,
        },
      });

      if (user && user.password) {
        const isPasswordValid: boolean = await bcrypt.compare(
          password,
          user.password,
        );
        if (isPasswordValid) {
          const { password, ...rest } = user;
          return rest;
        } else {
          throw new NotFoundException('Invalid credentials');
        }
      }
      throw new NotFoundException('User not found');
    } catch (error: unknown) {
      this.logger.error(`User validation failed`);

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('User validation failed');
    }
  }

  async signup(createUserDto: User) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone: createUserDto.phone },
      });
      if (existingUser) {
        throw new HttpException('User already exists', 400);
      }

      const password: string = createUserDto.password;
      const salt = Number(process.env.SALT_ROUND) || 10;
      const hashedPassword = await bcrypt.hash(password, salt);

      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: createUserDto.name,
            email: createUserDto.email,
            phone: createUserDto.phone,
            password: hashedPassword,
            role: createUserDto.role,
          },
          include: {
            passenger: true,
            staff: true,
            notifications: true,
          },
        });

        if (user.role === 'PASSENGER') {
          await tx.passenger.create({
            data: {
              userId: user.id,
            },
          });
        }

        if (user.role === 'STAFF') {
          await tx.staff.create({
            data: {
              userId: user.id,
              position: createUserDto.staffPosition,
            },
          });
        }

        const { password: _, ...safeUser } = user;
        return safeUser;
      });
    } catch (error: any) {
      this.logger.error(`internal server error`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('User already exists', 400);
        }
      }
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('internal server error');
    }
  }

  async login(user: { phone: string }) {
    const exitingUser = await this.prisma.user.findUnique({
      where: { phone: user.phone },
    });
    if (!exitingUser) {
      throw new NotFoundException('User not found');
    }

    const payload = {
      id: exitingUser.id,
      phone: exitingUser.phone,
      role: exitingUser.role,
    };
    const token = this.jwtService.sign(payload);

    // console.log('🚀 ~ AuthService ~ login ~ email:', exitingUser.email);
    return {
      id: exitingUser.id,
      name: exitingUser.name,
      phone: exitingUser.phone,
      role: exitingUser.role,
      jwtToken: token,
    };
  }
}
