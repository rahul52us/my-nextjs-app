import type { Metadata } from 'next';
import WorkflowRunner from '../../WorkflowRunner';
import WorkflowAccessGuard from '../../WorkflowAccessGuard';

export const metadata: Metadata = {
  title: 'Workflow Runner | Toolsahayata',
  description: 'Upload a file once and process it through the selected workflow.',
};

type WorkflowRunPageProps = {
  params: {
    workflowId: string;
  };
};

export default async function WorkflowRunPage({ params }: WorkflowRunPageProps) {
  const { workflowId } = await params;
  return (
    <WorkflowAccessGuard>
      <WorkflowRunner workflowId={workflowId} />
    </WorkflowAccessGuard>
  );
}
