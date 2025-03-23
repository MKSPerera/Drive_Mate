import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { AvailabilityStatus } from '@prisma/client';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;
}
