import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RejectJobDto {
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
} 