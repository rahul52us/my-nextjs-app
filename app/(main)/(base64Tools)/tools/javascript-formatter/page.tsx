import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "JavaScript Formatter | Beautify JS Code",
  description: "Format, align, and beautify messy JavaScript code online.",
};

export default function Page() {
  return <ToolContent />;
}
