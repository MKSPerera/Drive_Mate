import { JobState, PostType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsInt()
  @IsNotEmpty()
  numberOfPassengers: number;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsDateString()
  @IsNotEmpty()
  pickupTime: string;

  @IsNumber()
  @IsNotEmpty()
  distance: number;

  @IsNumber()
  @IsNotEmpty()
  paymentAmount: number;

  @IsString()
  @IsOptional()
  additionalDetails?: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  postType: PostType;

  @IsEnum(JobState)
  @IsOptional()
  currentState?: JobState;

  @IsInt()
  @IsOptional()
  assignedDriverId?: number;
}
