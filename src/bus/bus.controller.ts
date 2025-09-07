import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BusService } from './bus.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { BusQueryDto } from './dto/bus-query.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('bus')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  create(@Body() createBusDto: CreateBusDto) {
    return this.busService.create(createBusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/bulk')
  createMany(@Body() createBusDto: CreateBusDto[]) {
    return this.busService.createMany(createBusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: BusQueryDto) {
    return this.busService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusDto: UpdateBusDto) {
    return this.busService.update(id, updateBusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busService.remove(id);
  }
}
