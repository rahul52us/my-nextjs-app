import type { Metadata } from 'next';
import PdfSplitterContent from './content';

export const metadata: Metadata = {
  title: 'PDF Splitter | PDF Tools',
  description: 'Split PDF files into individual pages or extract specific pages easily.',
};

export default function PdfSplitterPage() {
  return <PdfSplitterContent />;
}