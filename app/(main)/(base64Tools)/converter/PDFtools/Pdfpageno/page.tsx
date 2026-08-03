import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Page Numberer | Add Page Numbers to PDF",
  description: "Add page numbers to your PDF documents with custom positioning, font sizes, and styles.",
};

export default function Page() {
  return <ToolContent />;
}
