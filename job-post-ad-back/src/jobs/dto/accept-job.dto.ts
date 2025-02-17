import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptJobDto {
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @IsInt()
  @IsNotEmpty()
  driverId: number;
}