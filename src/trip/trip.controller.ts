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
import { OneWayTripDto } from './dto/one-way-trip-query.dto';
import { RoundTripDto } from './dto/round-trip-query.dto';

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

  @Post('/one-way-trip')
  searchWithDateAndRoute(@Body() body: OneWayTripDto) {
    return this.tripService.SearchOneWayTrip(body);
  }

  @Post('/round-trip')
  searchRoundTrip(@Body() body: RoundTripDto) {
    return this.tripService.searchRoundTrip(body);
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
