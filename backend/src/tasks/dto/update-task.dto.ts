import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString({
    message: 'title must be a string',
  })
  @MaxLength(100, {
    message: 'title must not exceed 100 characters',
  })
  @Matches(/\S/, {
    message: 'title must not be empty',
  })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be TODO, IN_PROGRESS or DONE',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}