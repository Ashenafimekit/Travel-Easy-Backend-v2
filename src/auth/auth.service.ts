import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly loger = new Logger(AuthService.name, { timestamp: true });
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });

      if (user && user.password) {
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (isPasswordValid) {
          const { password: _password, ...result } = user;
          return result;
        } else {
          throw new NotFoundException('Invalid credentials');
        }
      }
      throw new NotFoundException('User not found');
    } catch (error: unknown) {
      console.error('Error validating user:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('User validation failed');
    }
  }

  async signup(createUserDto: CreateUserDto) {
    try {
      const password = createUserDto.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      this.loger.error(`internal server error`);
      throw new Error(error);
    }
  }

  async login(user: { email: string }) {
    const exitingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!exitingUser) {
      throw new NotFoundException('User not found');
    }

    const payload = {
      email: exitingUser.email,
      id: exitingUser.id,
      role: exitingUser.role,
    };
    const token = this.jwtService.sign(payload);

    // console.log('🚀 ~ AuthService ~ login ~ email:', exitingUser.email);
    return {
      user: {
        id: exitingUser.id,
        email: exitingUser.email,
        name: exitingUser.name,
        accessToken: token,
      },
    };
  }
}
