import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Text Diff Checker | Compare Text & Code Online",
  description: "Compare two text files or code snippets side by side to find additions, deletions, and modifications.",
};

export default function Page() {
  return <ToolContent />;
}
