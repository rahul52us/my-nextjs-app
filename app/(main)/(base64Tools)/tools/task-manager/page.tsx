import type { Metadata } from 'next';
import TaskManagerContent from './content';

export const metadata: Metadata = {
  title: 'Task Manager | Trello-like Kanban Board',
  description: 'Manage, organize, and drag-and-drop your tasks through To Do, In Progress, and Completed states. Save your tasks securely.',
};

export default function TaskManagerPage() {
  return <TaskManagerContent />;
}
