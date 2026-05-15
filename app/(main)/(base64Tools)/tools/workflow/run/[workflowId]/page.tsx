import type { Metadata } from 'next';
import WorkflowRunner from '../../WorkflowRunner';

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
  return <WorkflowRunner workflowId={workflowId} />;
}
