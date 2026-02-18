import type { Metadata } from 'next';
import PdfToJpgContent from './content';

export const metadata: Metadata = {
  title: 'PDF to JPG Converter | Convert PDF Pages to Images',
  description: 'Convert PDF files to high-quality JPG images instantly. Extract pages from your PDF documents as separate image files securely in your browser.',
};

export default function PdfToJpgPage() {
  return <PdfToJpgContent />;
}