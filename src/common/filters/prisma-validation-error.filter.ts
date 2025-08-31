/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientValidationError)
export class PrismaValidationErrorFilter implements ExceptionFilter {
  private readonly loger = new Logger(PrismaValidationErrorFilter.name, {
    timestamp: true,
  });
  public catch(error: Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    this.loger.error(`${req.method} ${req.url} Prisma client validation error`);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: {
        common: 'Something went wrong.',
      },
    });
  }
}
