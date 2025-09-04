import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BusQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  filterField?: string;

  @IsOptional()
  @IsString()
  filterValue?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  all?: boolean;
}
