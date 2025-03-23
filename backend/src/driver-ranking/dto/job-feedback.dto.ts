import { IsInt, IsIn, Min } from 'class-validator';

export class JobFeedbackDto {
  @IsInt()
  @Min(1)
  jobId: number;

  @IsInt()
  @IsIn([-1, 1])
  feedbackValue: number;
} 