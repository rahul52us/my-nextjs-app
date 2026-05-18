import type { Metadata } from 'next';
import WorkflowBuilderContent from './content';
import WorkflowAccessGuard from './WorkflowAccessGuard';

export const metadata: Metadata = {
  title: 'Workflow Builder | Toolsahayata',
  description: 'Create, save, and run custom workflows by selecting tools and ordering steps.',
};

export default function WorkflowPage() {
  return (
    <>
      <WorkflowAccessGuard />
      <WorkflowBuilderContent />
    </>
  );
}
