import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { UserModule } from './user/user.module';
import { BusModule } from './bus/bus.module';
import { RoutesModule } from './routes/routes.module';
import { TicketsModule } from './tickets/tickets.module';
import { PassengersModule } from './passengers/passengers.module';
import { CaslModule } from './casl/casl.module';
import { TripModule } from './trip/trip.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, BusModule, RoutesModule, TicketsModule, PassengersModule, CaslModule, TripModule, BookingModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'user', method: RequestMethod.ALL })
      .forRoutes({ path: 'post', method: RequestMethod.ALL });
  }
}
