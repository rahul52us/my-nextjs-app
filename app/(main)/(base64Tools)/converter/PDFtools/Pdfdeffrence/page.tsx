import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Difference Checker | Compare Two PDF Files",
  description: "Compare two PDF documents side by side and highlight visual and textual differences.",
};

export default function Page() {
  return <ToolContent />;
}
