import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from 'src/user/type/user.type';
@Controller('auth')
export class AuthController {
  constructor(private readonly auhtService: AuthService) {}

  @Post('/signup')
  signup(@Body() creatUserDto: User) {
    return this.auhtService.signup(creatUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async login(@Request() req: { user: { phone: string } }) {
    return await this.auhtService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: { id: string; email: string } }): unknown {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  logout(@Request() req: { logout: () => any }): unknown {
    return req.logout();
  }
}
