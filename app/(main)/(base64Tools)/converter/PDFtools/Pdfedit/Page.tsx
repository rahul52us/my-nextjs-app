import type { Metadata } from 'next';
import AdvancedPDFEditorContent from './content';

export const metadata: Metadata = {
  title: 'Free PDF Editor | Edit, Annotate, and Sign PDFs Online',
  description: 'Upload and edit PDF files directly in your browser. Add text, images, shapes, redactions, and export high-quality edited PDFs freely and securely.',
};

export default function AdvancedPDFEditorPage() {
  return <AdvancedPDFEditorContent />;
}