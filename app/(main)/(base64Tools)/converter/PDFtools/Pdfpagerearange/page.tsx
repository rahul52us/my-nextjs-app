import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Page Rearranger | Reorder PDF Pages",
  description: "Drag and drop to reorder, delete, or organize pages in your PDF files online.",
};

export default function Page() {
  return <ToolContent />;
}
