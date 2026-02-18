import type { Metadata } from 'next';
import PDFToWordContent from './content';

export const metadata: Metadata = {
  title: 'PDF to Word Converter | Convert PDF to DOCX Online',
  description: 'Convert PDF documents to editable Microsoft Word files (.docx) directly in your browser. Secure, fast, and free PDF to Word conversion.',
};

export default function PDFToWordPage() {
  return <PDFToWordContent />;
}