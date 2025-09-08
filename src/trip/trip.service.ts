/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Trip } from '@prisma/client';
import { TripQueryDto } from './dto/trip-query.dto';

@Injectable()
export class TripService {
  private logger = new Logger(TripService.name, { timestamp: true });
  constructor(private readonly prisma: PrismaService) {}
  async create(createTripDto: CreateTripDto) {
    try {
      const { buses, ...tripData } = createTripDto;
      const trip = await this.prisma.trip.create({
        data: {
          ...tripData,
          buses: {
            connect: buses.map((id: string) => ({ id })),
          },
        },
      });

      return trip;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async createMany(createTripDto: CreateTripDto[]) {
    try {
      return await this.prisma.$transaction(
        createTripDto.map((trip) =>
          this.prisma.trip.create({
            data: {
              departureTime: trip.departureTime,
              arrivalTime: trip.arrivalTime,
              status: trip.status,
              route: { connect: { id: trip.routeId } },
              driver: trip.driverId
                ? { connect: { id: trip.driverId } }
                : undefined,
              buses: {
                connect: trip.buses.map((busId: string) => ({ id: busId })),
              },
            },
            include: {
              route: true,
              buses: true,
              driver: true,
            },
          }),
        ),
      );
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async findAll(query: TripQueryDto) {
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
        const trips = await this.prisma.trip.findMany({
          orderBy: { [sortField]: sortOrder },
          where: { deletedAt: null },
          include: {
            route: {
              select: {
                id: true,
                departure: true,
                destination: true,
                distanceKm: true,
                estimatedDuration: true,
              },
            },
            buses: {
              select: {
                id: true,
                busNumber: true,
                capacity: true,
                type: true,
                status: true,
                seats: {
                  select: {
                    id: true,
                    seatNumber: true,
                    isAvailable: true,
                  },
                },
              },
            },
          },
        });
        const total = trips.length;
        return {
          total,
          page: 1,
          perPage: total,
          totalPages: 1,
          trips,
        };
      }

      const where: Prisma.TripWhereInput = {};

      if (search) {
        where.OR = [
          { departureTime: { equals: search } },
          { arrivalTime: { equals: search } },
          { routeId: { contains: search, mode: 'insensitive' } },
        ];
        where.deletedAt = null;
      }
      if (filterField && filterValue) {
        where[filterField] = { equals: filterValue };
        where.deletedAt = null;
      }

      const [trips, total] = await Promise.all([
        this.prisma.trip.findMany({
          where,
          skip,
          take,
          orderBy: { [sortField]: sortOrder },
          select: {
            id: true,
            route: {
              select: {
                id: true,
                departure: true,
                destination: true,
                distanceKm: true,
                estimatedDuration: true,
              },
            },
            buses: {
              select: {
                id: true,
                busNumber: true,
                capacity: true,
                type: true,
                status: true,
                seats: {
                  select: {
                    id: true,
                    seatNumber: true,
                    isAvailable: true,
                  },
                },
              },
            },
            departureTime: true,
            arrivalTime: true,
            driverId: true,
            status: true,
            feedbacks: true,
            bookings: true,
          },
        }),
        this.prisma.trip.count({ where }),
      ]);

      return {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        trips,
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
      const trip = await this.prisma.trip.findUnique({ where: { id: id } });
      if (!trip) throw new HttpException('Trip not found', 404);
      return trip;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const { buses, ...tripData } = updateTripDto;
    try {
      const checkTrip = await this.findOne(id);
      if (!checkTrip) throw new HttpException('Trip not found', 404);

      const trip = await this.prisma.trip.update({
        where: { id: id },
        data: {
          ...tripData,
          ...(buses !== undefined && {
            buses: {
              set: buses.map((id: string) => ({ id })),
            },
          }),
        },
        include: {
          buses: true,
        },
      });

      return trip;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async remove(id: string) {
    try {
      const trip = await this.prisma.trip.update({
        where: { id: id },
        data: { deletedAt: new Date() },
      });
      if (!trip) throw new HttpException('Trip not found', 404);
      return trip;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }
}
