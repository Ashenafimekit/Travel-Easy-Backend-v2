import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingQueryDto } from './dto/booking-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingService {
  private logger = new Logger(BookingService.name, { timestamp: true });
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createBookingDto: CreateBookingDto,
    user: { userId: string; role: string },
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const { seatId, tripId, totalAmount } = createBookingDto;

        // Check all seats first
        const seats = await tx.seat.findMany({
          where: { id: { in: seatId } },
        });

        if (seats.length !== seatId.length) {
          throw new HttpException('Some seats not found', 404);
        }

        const unavailableSeat = seats.find((s) => !s.isAvailable);
        if (unavailableSeat) {
          throw new HttpException(
            `Seat ${unavailableSeat.id} is already reserved`,
            400,
          );
        }

        // find passenger
        const passenger = await tx.passenger.findUnique({
          where: { userId: user.userId },
        });

        // find staff
        const staff = await tx.staff.findUnique({
          where: { userId: user.userId },
        });

        // Create booking
        const booking = await tx.booking.create({
          data: {
            tripId,
            passengerId: passenger?.id,
            staffId: staff?.id,
            totalAmount,
          },
          include: {
            passenger: true,
            trip: true,
            tickets: true,
          },
        });

        // Create tickets
        const tickets = await Promise.all(
          seatId.map((id) =>
            tx.ticket.create({
              data: {
                bookingId: booking.id,
                seatId: id,
                price: totalAmount / seatId.length,
              },
            }),
          ),
        );

        // Mark seats as unavailable
        await tx.seat.updateMany({
          where: { id: { in: seatId } },
          data: { isAvailable: false },
        });

        return { booking, tickets };
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async findAll(query: BookingQueryDto) {
    try {
      const { search, filterField, filterValue } = query;
      let { page, perPage, sortField, sortOrder, all } = query;

      page = page || 1;
      perPage = perPage || 10;

      const skip = (page - 1) * perPage;
      const take = perPage;

      sortOrder = sortOrder || 'desc';
      sortField = sortField || 'createdAt';

      all = all ?? false;

      if (all) {
        const bookings = await this.prisma.booking.findMany({
          orderBy: { [sortField]: sortOrder },
          where: { deletedAt: null },
          include: {
            passenger: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                  },
                },
              },
            },
            staff: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                  },
                },
              },
            },
            trip: {
              include: {
                route: {
                  select: {
                    id: true,
                    departure: true,
                    destination: true,
                    price: true,
                    distanceKm: true,
                    estimatedDuration: true,
                  },
                },
                buses: {
                  select: {
                    id: true,
                    busNumber: true,
                    type: true,
                    capacity: true,
                    status: true,
                  },
                },
              },
            },
            tickets: {
              include: {
                seat: true,
              },
            },
          },
        });
        const total = bookings.length;
        return {
          total,
          page: 1,
          perPage: total,
          totalPages: 1,
          bookings,
        };
      }

      const where: Prisma.BookingWhereInput = {
        deletedAt: null,
      };

      if (search) {
        const date = new Date(search);
        const isValidDate = !isNaN(date.getTime()); // check if it's a valid date

        where.OR = [];

        if (isValidDate) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          where.OR.push({ bookingDate: { gte: startOfDay, lte: endOfDay } });
        }

        // Always search text fields for route
        where.OR.push(
          { passenger: { id: { contains: search, mode: 'insensitive' } } },
          { trip: { id: { contains: search, mode: 'insensitive' } } },
        );
      }
      if (filterField && filterValue) {
        where[filterField] = { equals: filterValue };
        where.deletedAt = null;
      }

      const [bookings, total] = await Promise.all([
        this.prisma.booking.findMany({
          where,
          skip,
          take,
          orderBy: { [sortField]: sortOrder },
          include: {
            passenger: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                  },
                },
              },
            },
            staff: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                  },
                },
              },
            },
            trip: {
              include: {
                route: {
                  select: {
                    id: true,
                    departure: true,
                    destination: true,
                    price: true,
                    distanceKm: true,
                    estimatedDuration: true,
                  },
                },
                buses: {
                  select: {
                    id: true,
                    busNumber: true,
                    type: true,
                    capacity: true,
                    status: true,
                  },
                },
              },
            },
            tickets: {
              include: {
                seat: true,
              },
            },
          },
        }),
        this.prisma.booking.count({ where }),
      ]);

      return {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        bookings,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async findOne(id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: id, deletedAt: null },
        include: {
          passenger: true,
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
          trip: {
            include: {
              route: {
                select: {
                  id: true,
                  departure: true,
                  destination: true,
                  price: true,
                  distanceKm: true,
                  estimatedDuration: true,
                },
              },
              buses: {
                select: {
                  id: true,
                  busNumber: true,
                  type: true,
                  capacity: true,
                  status: true,
                },
              },
            },
          },
          tickets: {
            include: {
              seat: true,
            },
          },
        },
      });
      if (!booking) throw new HttpException('Booking not found', 404);
      return booking;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    try {
      const checkBooking = await this.findOne(id);
      if (!checkBooking)
        throw new HttpException(`Booking ${id} not found`, 404);

      const booking = await this.prisma.booking.update({
        where: { id: id },
        data: updateBookingDto,
      });

      if (!booking) throw new HttpException('Booking not found', 404);
      return booking;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async remove(id: string) {
    try {
      const booking = await this.prisma.booking.update({
        where: { id: id },
        data: { deletedAt: new Date() },
      });
      if (!booking) throw new HttpException('Booking not found', 404);
      return booking;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }
}
