import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RouteQueryDto } from './dto/route-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name, { timestamp: true });
  constructor(private prisma: PrismaService) {}
  async create(createRouteDto: CreateRouteDto) {
    try {
      const checkRoute = await this.prisma.route.findUnique({
        where: {
          departure_destination: {
            departure: createRouteDto.departure,
            destination: createRouteDto.destination,
          },
        },
      });
      if (checkRoute) throw new HttpException('Route already exists', 400);

      const route = await this.prisma.route.create({ data: createRouteDto });
      return route;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async createMany(createRouteDto: CreateRouteDto[]) {
    try {
      const routes = await this.prisma.route.createMany({
        data: createRouteDto,
        skipDuplicates: true,
      });
      return routes.count;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async findAll(query: RouteQueryDto) {
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
        const routes = await this.prisma.route.findMany({
          orderBy: { [sortField]: sortOrder },
          where: { deletedAt: null },
        });
        const total = routes.length;
        return {
          total,
          page: 1,
          perPage: total,
          totalPages: 1,
          routes,
        };
      }

      const where: Prisma.RouteWhereInput = {};

      if (search) {
        where.OR = [
          { deletedAt: null },
          { destination: { contains: search, mode: 'insensitive' } },
          { departure: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (filterField && filterValue) {
        where[filterField] = { equals: filterValue };
        where.deletedAt = null;
      }

      const [routes, total] = await Promise.all([
        this.prisma.route.findMany({
          where,
          skip,
          take,
          orderBy: { [sortField]: sortOrder },
        }),
        this.prisma.route.count({ where }),
      ]);

      return {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        routes,
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
      const route = await this.prisma.route.findUnique({ where: { id: id } });
      if (!route) throw new HttpException('Route not found', 404);
      return route;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    try {
      const checkRoute = await this.prisma.route.findUnique({
        where: { id },
      });
      if (!checkRoute) throw new HttpException('Route not found exists', 404);

      const route = await this.prisma.route.update({
        where: { id: id },
        data: updateRouteDto,
      });

      if (!route) throw new HttpException('Route not found', 404);
      return route;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async remove(id: string) {
    try {
      const route = await this.prisma.route.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      if (!route) throw new HttpException('Route not found', 404);
      return route;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new NotFoundException('Route not found');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2025') {
        throw new NotFoundException('Route not found');
      }
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException('internal server error');
    }
  }
}
