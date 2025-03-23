import { PartialType } from '@nestjs/mapped-types';
import { JobState } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsEnum(JobState)
  @IsOptional()
  currentState?: JobState;

  @IsNumber()
  @IsOptional()
  paymentAmount?: number;
}
