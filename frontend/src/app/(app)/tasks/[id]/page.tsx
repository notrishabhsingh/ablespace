import { TaskDetail } from '@/components/tasks/task-detail';

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TaskDetail taskId={params.id} />;
}
