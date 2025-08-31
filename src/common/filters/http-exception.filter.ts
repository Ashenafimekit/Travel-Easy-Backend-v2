import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

Catch(HttpException);

export class HttpExceptionFilter implements ExceptionFilter {
  private readonly loger = new Logger(HttpException.name, { timestamp: true });
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.loger.error(`${request.method} ${request.url} ${exception.message}`);

    const errorResponse = {
      statusCode: status,
      timeStamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
    };

    return response.status(status).json(errorResponse);
  }
}
