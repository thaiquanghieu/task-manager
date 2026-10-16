import AppDataSource from './data-source';
import { Task, TaskStatus } from '../tasks/entities/task.entity';

async function seed() {
  await AppDataSource.initialize();

  const taskRepository = AppDataSource.getRepository(Task);

  const count = await taskRepository.count();

  if (count > 0) {
    console.log('Database already has data.');
    await AppDataSource.destroy();
    return;
  }

  const tasks = taskRepository.create([
    {
      title: 'Học NestJS',
      description: 'Tìm hiểu controller và service',
      status: TaskStatus.TODO,
    },
    {
      title: 'Học PostgreSQL',
      description: 'Tìm hiểu cách lưu dữ liệu',
      status: TaskStatus.IN_PROGRESS,
    },
    {
      title: 'Học Docker',
      description: 'Chạy PostgreSQL bằng Docker Compose',
      status: TaskStatus.DONE,
    },
    {
      title: 'Làm API tạo công việc',
      description: 'POST /tasks',
      status: TaskStatus.TODO,
    },
    {
      title: 'Làm API danh sách công việc',
      description: 'GET /tasks',
      status: TaskStatus.TODO,
    },
  ]);

  await taskRepository.save(tasks);

  console.log('Seed completed successfully.');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});