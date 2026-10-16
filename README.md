# Task Manager

Ứng dụng quản lý công việc đơn giản, gồm giao diện Next.js, API NestJS, PostgreSQL và Docker Compose.

## Công nghệ

- Next.js
- NestJS
- TypeScript
- PostgreSQL
- Docker Compose
- TypeORM

## Chức năng

- Thêm công việc.
- Xem danh sách công việc mới nhất trước.
- Xem chi tiết một công việc.
- Sửa công việc.
- Xóa công việc với hộp thoại xác nhận.
- Lọc theo trạng thái: `TODO`, `IN_PROGRESS`, `DONE`.
- Kiểm tra dữ liệu đầu vào ở frontend và backend.

## Phần mềm cần cài

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 22 trở lên và npm nếu muốn chạy project không dùng Docker.
- Git.

## Chạy toàn bộ hệ thống bằng Docker

Tại thư mục gốc của project:

```bash
docker compose up --build -d
```

Docker Compose sẽ chạy ba service:

| Service    | Cổng   | Chức năng         |
| ---------- | ------ | ----------------- |
| `web`      | `3000` | Giao diện Next.js |
| `api`      | `3001` | API NestJS        |
| `database` | `5433` | PostgreSQL        |

Khi API container khởi động, migration và seed dữ liệu mẫu sẽ tự chạy.

Truy cập:

- Giao diện: <http://localhost:3000/tasks>
- API: <http://localhost:3001/tasks>

## Biến môi trường

### Backend

Tạo file `backend/.env` từ file mẫu:

```bash
cd backend
cp .env.example .env
```

Nội dung dùng khi chạy backend ở máy:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=task_manager
```

### Frontend

Tạo file `frontend/.env.local` từ file mẫu:

```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Không commit file `.env` hoặc `.env.local`.

## Chạy không dùng Docker

### 1. Khởi động PostgreSQL

Tại thư mục gốc:

```bash
docker compose up -d database
```

### 2. Chạy backend

```bash
cd backend
npm install
cp .env.example .env
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
npm run seed
npm run start:dev
```

Backend chạy tại <http://localhost:3001>.

### 3. Chạy frontend

Mở một terminal khác:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend chạy tại <http://localhost:3000/tasks>.

## Migration và dữ liệu mẫu

Khi dùng Docker, migration và seed tự chạy khi container `api` khởi động.

Có thể chạy lại thủ công:

```bash
docker compose exec api npx typeorm migration:run -d dist/database/data-source.js
docker compose exec api node dist/database/seed.js
```

Seed chỉ tạo dữ liệu khi database chưa có task.

## API

| Method   | Endpoint             | Chức năng               |
| -------- | -------------------- | ----------------------- |
| `POST`   | `/tasks`             | Tạo công việc           |
| `GET`    | `/tasks`             | Lấy danh sách công việc |
| `GET`    | `/tasks/:id`         | Xem chi tiết công việc  |
| `PATCH`  | `/tasks/:id`         | Cập nhật công việc      |
| `DELETE` | `/tasks/:id`         | Xóa công việc           |
| `GET`    | `/tasks?status=DONE` | Lọc theo trạng thái     |

Ví dụ tạo công việc:

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Hoàn thành README","status":"TODO"}'
```

## Build

Build backend và frontend ở máy:

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

Build toàn bộ Docker images:

```bash
docker compose build
```

## Xem log và dừng hệ thống

Xem log của tất cả service:

```bash
docker compose logs -f
```

Xem log API:

```bash
docker compose logs -f api
```

Dừng các container nhưng giữ dữ liệu PostgreSQL:

```bash
docker compose stop
```

Xóa các container và network nhưng vẫn giữ dữ liệu PostgreSQL:

```bash
docker compose down
```

## Hạn chế

- Chưa có đăng nhập và phân quyền.
- Chưa có kiểm thử tự động đầy đủ cho toàn bộ API và giao diện.
- Chưa deploy ứng dụng lên môi trường production.
