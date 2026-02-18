import type { Metadata } from 'next';
import PdfMergerContent from './content';

export const metadata: Metadata = {
  title: 'PDF Merger | PDF Tools',
  description: 'Merge multiple PDF files into one document easily.',
};

export default function PdfMergerPage() {
  return <PdfMergerContent />;
}