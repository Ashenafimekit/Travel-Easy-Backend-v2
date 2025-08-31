/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Response } from 'express';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

const DUPLICATE_FIELD = 'P2002';
const NOT_FOUND = 'P2025';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const { code, meta, message } = exception;
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    if (code === DUPLICATE_FIELD) {
      const [target] = (meta?.['target'] as string[]) ?? [];
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        errors: {
          [target]: `Duplicate ${target}`,
        },
      });
    }
    const errorMessage = message?.split('\n')?.reverse()?.[0];
    if (code === NOT_FOUND) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        errors: {
          common: errorMessage,
        },
      });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: {
        common: 'Something went wrong.',
      },
    });
  }
}
@Catch(Prisma.PrismaClientUnknownRequestError)
export class PrismaUnknownExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  public catch(
    exception: Prisma.PrismaClientUnknownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    this.logger.error(`${req.method} ${req.url}  ${exception.message}`);

    const isOverLappingDateRange = exception.message.includes(
      'no_overlaping_date_range',
    );

    if (isOverLappingDateRange) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        errors: {
          common: 'Overlapping date range.',
        },
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: {
        common: 'Something went wrong.',
      },
    });
  }
}
