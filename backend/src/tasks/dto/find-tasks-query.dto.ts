import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class FindTasksQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be TODO, IN_PROGRESS or DONE',
  })
  status?: TaskStatus;
}