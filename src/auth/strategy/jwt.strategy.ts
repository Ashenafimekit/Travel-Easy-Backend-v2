import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constant';
import { JwtPayload } from '../dto/jwtPayload.type';
import { Request } from 'express';

const extractJwtFromCookie = (req: Request): string | null => {
  const cookies = req?.cookies as { [key: string]: unknown } | undefined;
  if (cookies && typeof cookies.jwtToken === 'string') {
    return cookies.jwtToken;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!jwtConstants.secret) {
      throw new Error('JWT secret is not defined');
    }
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: JwtPayload) {
    // console.log('🚀 ~ JwtStrategy ~ validate ~ payload:', payload);
    return { userId: payload.id, phone: payload.phone, role: payload.role };
  }
}
