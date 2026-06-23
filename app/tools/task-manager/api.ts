import axios from "axios";

export interface Bucket {
  id: string;
  name: string;
  isDefault: boolean;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  bucketId: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── BUCKETS ────────────────────────────────────────────────────────────────
export const fetchBuckets = async (): Promise<Bucket[]> => {
  const res = await axios.get("/buckets");
  return res.data.data;
};

export const createBucket = async (name: string): Promise<Bucket> => {
  const res = await axios.post("/buckets", { name });
  return res.data.data;
};

export const updateBucket = async (
  bucketId: string,
  name: string
): Promise<Bucket> => {
  const res = await axios.put(`/buckets/${bucketId}`, { name });
  return res.data.data;
};

export const deleteBucket = async (bucketId: string): Promise<void> => {
  await axios.delete(`/buckets/${bucketId}`);
};

// ── TASKS ──────────────────────────────────────────────────────────────────
export const fetchTasks = async (bucketId?: string): Promise<Task[]> => {
  const params = bucketId ? { bucketId } : {};
  const res = await axios.get("/tasks", { params });
  return res.data.data;
};

export const createTask = async (payload: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  bucketId?: string;
}): Promise<Task> => {
  const res = await axios.post("/tasks", payload);
  return res.data.data;
};

export const updateTask = async (
  taskId: string,
  payload: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string | null;
    bucketId: string;
  }>
): Promise<Task> => {
  const res = await axios.put(`/tasks/${taskId}`, payload);
  return res.data.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axios.delete(`/tasks/${taskId}`);
};
