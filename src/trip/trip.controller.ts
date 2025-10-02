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
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { SearchTripDto } from './dto/search-trip-query.dto';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/bulk')
  createMany(@Body() createTripDto: CreateTripDto[]) {
    return this.tripService.createMany(createTripDto);
  }

  @Get()
  findAll(@Query() query: TripQueryDto) {
    return this.tripService.findAll(query);
  }

  @Post('/search-trip-with-route')
  searchWithRoute(@Body() body: { routeId: string }) {
    return this.tripService.searchTripWithRoute(body);
  }

  @Post('/search-trip-with-date-and-route')
  searchWithDateAndRoute(@Body() body: SearchTripDto) {
    return this.tripService.searchTripWithDateAndRoute(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
}
