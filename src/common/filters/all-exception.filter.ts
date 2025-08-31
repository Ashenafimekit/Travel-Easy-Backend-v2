import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name, {
    timestamp: true,
  });

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if it's an HttpException
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const errorResponse = error.getResponse();

      this.logger.error(
        `HTTP Error: ${status} - ${JSON.stringify(errorResponse)}`,
      );

      return response.status(status).json({
        statusCode: status,
        path: request.url,
        ...(typeof errorResponse === 'string'
          ? { message: errorResponse }
          : errorResponse),
      });
    }

    // Otherwise, treat it as an unknown server error
    this.logger.error('Unexpected Error: ', error as Error);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal Server Error',
      path: request.url,
    });
  }
}
