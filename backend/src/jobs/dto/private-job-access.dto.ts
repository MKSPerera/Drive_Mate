import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class PrivateJobAccessDto {
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @IsArray()
  @IsNotEmpty()
  driverIds: number[];
} 