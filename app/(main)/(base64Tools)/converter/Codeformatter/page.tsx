import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Code Formatter & Beautifier | Multi-Language Code Formatter",
  description: "Format and beautify JavaScript, TypeScript, HTML, CSS, JSON, and XML code online.",
};

export default function Page() {
  return <ToolContent />;
}
