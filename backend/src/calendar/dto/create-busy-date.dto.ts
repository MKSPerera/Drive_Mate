import { IsISO8601, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusyDateDto {
  @IsNotEmpty()
  @IsISO8601()
  startDate: string;

  @IsNotEmpty()
  @IsISO8601()
  endDate: string;
} 