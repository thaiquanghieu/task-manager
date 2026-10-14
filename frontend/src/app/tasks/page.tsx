"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskForm = {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const emptyForm: TaskForm = {
  title: "",
  description: "",
  status: "TODO",
  dueDate: "",
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  DONE: "Hoàn thành",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = filter === "ALL" ? "" : `?status=${filter}`;
      const response = await fetch(`${API_URL}/tasks${query}`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách công việc.");
      }

      setTasks(await response.json());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadTasks();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [loadTasks]);

  function resetForm() {
    setForm(emptyForm);
    setEditingTaskId(null);
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Tên công việc không được để trống.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        editingTaskId
          ? `${API_URL}/tasks/${editingTaskId}`
          : `${API_URL}/tasks`,
        {
          method: editingTaskId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            status: form.status,
            dueDate: form.dueDate || null,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message ?? "Không thể lưu công việc.");
      }

      resetForm();
      await loadTasks();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa công việc này?");
    if (!confirmed) return;

    setDeletingTaskId(id);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa công việc.");
      }

      await loadTasks();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Task Manager</p>
          <h1>Quản lý công việc</h1>
          <p>Thêm, cập nhật, lọc và hoàn thành các công việc của bạn.</p>
        </header>

        <section className={styles.formCard}>
          <h2>{editingTaskId ? "Sửa công việc" : "Thêm công việc"}</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              Tên công việc
              <input
                value={form.title}
                maxLength={100}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Ví dụ: Hoàn thành giao diện"
                required
              />
            </label>

            <label>
              Mô tả
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Mô tả ngắn (không bắt buộc)"
                rows={3}
              />
            </label>

            <div className={styles.formRow}>
              <label>
                Trạng thái
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as TaskStatus,
                    })
                  }
                >
                  <option value="TODO">Chưa làm</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="DONE">Hoàn thành</option>
                </select>
              </label>

              <label>
                Hạn hoàn thành
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm({ ...form, dueDate: event.target.value })
                  }
                />
              </label>
            </div>

            <div className={styles.actions}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang lưu..."
                  : editingTaskId
                    ? "Lưu thay đổi"
                    : "Thêm công việc"}
              </button>

              {editingTaskId && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2>Danh sách công việc</h2>

            <label className={styles.filter}>
              Lọc trạng thái
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "ALL" | TaskStatus)
                }
              >
                <option value="ALL">Tất cả</option>
                <option value="TODO">Chưa làm</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="DONE">Hoàn thành</option>
              </select>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {isLoading ? (
            <p className={styles.message}>Đang tải công việc...</p>
          ) : tasks.length === 0 ? (
            <p className={styles.message}>Chưa có công việc nào.</p>
          ) : (
            <ul className={styles.taskList}>
              {tasks.map((task) => (
                <li key={task.id} className={styles.task}>
                  <div>
                    <div className={styles.taskTitleRow}>
                      <h3>{task.title}</h3>
                      <span className={styles.status}>{statusLabels[task.status]}</span>
                    </div>

                    {task.description && <p>{task.description}</p>}

                    {task.dueDate && (
                      <small>Hạn hoàn thành: {task.dueDate.slice(0, 10)}</small>
                    )}
                  </div>

                  <div className={styles.taskActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => startEdit(task)}
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => void handleDelete(task.id)}
                      disabled={deletingTaskId === task.id}
                    >
                      {deletingTaskId === task.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}