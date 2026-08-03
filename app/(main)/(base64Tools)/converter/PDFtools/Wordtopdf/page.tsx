import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Word to PDF Converter | Convert DOCX to PDF",
  description: "Convert Microsoft Word (DOCX, DOC) documents into PDF format easily.",
};

export default function Page() {
  return <ToolContent />;
}
