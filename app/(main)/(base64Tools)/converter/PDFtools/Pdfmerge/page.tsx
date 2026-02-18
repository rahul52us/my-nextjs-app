import type { Metadata } from 'next';
import PdfMergerContent from './content';

export const metadata: Metadata = {
  title: 'Merge PDF Files | Combine Multiple PDFs Online',
  description: 'Merge multiple PDF files into one document instantly. Drag and drop, reorder pages, and combine PDFs securely in your browser.',
};

export default function PdfMergerPage() {
  return <PdfMergerContent />;
}