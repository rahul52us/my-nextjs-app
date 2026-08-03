import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Files to ZIP Converter | Compress Files Online",
  description: "Compress multiple files into a single downloadable ZIP archive instantly in your browser.",
};

export default function Page() {
  return <ToolContent />;
}
