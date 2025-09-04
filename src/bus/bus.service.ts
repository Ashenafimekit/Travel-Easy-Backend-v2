import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BusQueryDto } from './dto/query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BusService {
  private readonly logger = new Logger(BusService.name, { timestamp: true });
  constructor(private prisma: PrismaService) {}
  async create(createBusDto: CreateBusDto) {
    try {
      const checkBus = await this.prisma.bus.findUnique({
        where: { busNumber: createBusDto.busNumber },
      });
      if (checkBus) throw new HttpException('Bus number already exists', 400);

      const bus = this.prisma.bus.create({ data: createBusDto });
      return bus;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async createMany(createBusDto: CreateBusDto[]) {
    try {
      const buses = await this.prisma.bus.createMany({
        data: createBusDto,
        skipDuplicates: true,
      });
      return buses;
    } catch (error: any) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async findAll(query: BusQueryDto) {
    try {
      let {
        page,
        perPage,
        search,
        filterField,
        filterValue,
        sortField,
        sortOrder,
        all,
      } = query;

      page = page || 1;
      perPage = perPage || 10;

      const skip = (page - 1) * perPage;
      const take = perPage;

      sortOrder = sortOrder || 'desc';
      sortField = sortField || 'createdAt';

      all = all || false;

      if (all) {
        const buses = await this.prisma.bus.findMany({
          orderBy: { [sortField]: sortOrder },
        });
        const total = buses.length;
        return {
          total,
          page: 1,
          perPage: total,
          totalPages: 1,
          buses,
        };
      }

      const where: Prisma.BusWhereInput = {};

      if (search) {
        where.OR = [{ busNumber: { equals: Number(search) } }];
      }
      if (filterField && filterValue) {
        where[filterField] = { equals: filterValue };
      }

      const [buses, total] = await Promise.all([
        this.prisma.bus.findMany({
          where,
          skip,
          take,
          orderBy: { [sortField]: sortOrder },
        }),
        this.prisma.bus.count({ where }),
      ]);

      return {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        buses,
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
      const bus = await this.prisma.bus.findUnique({ where: { id: id } });
      if (!bus) throw new HttpException('Bus not found', 404);
      return bus;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async update(id: string, updateBusDto: UpdateBusDto) {
    try {
      const checkBus = await this.prisma.bus.findUnique({
        where: { busNumber: updateBusDto.busNumber },
      });
      if (checkBus) throw new HttpException('Bus number already exists', 400);

      const bus = await this.prisma.bus.update({
        where: { id: id },
        data: updateBusDto,
      });

      if (!bus) throw new HttpException('Bus not found', 404);
      return bus;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }

  async remove(id: string) {
    try {
      const bus = await this.prisma.bus.delete({ where: { id: id } });
      if (!bus) throw new HttpException('Bus not found', 404);
      return bus;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw error;
      throw new Error('internal server error');
    }
  }
}
