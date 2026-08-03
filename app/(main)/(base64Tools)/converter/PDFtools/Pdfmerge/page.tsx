import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Merger | Combine Multiple PDF Files",
  description: "Merge multiple PDF documents into a single PDF file quickly and securely.",
};

export default function Page() {
  return <ToolContent />;
}
