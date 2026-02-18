import type { Metadata } from 'next';
import WordToPdfConverterContent from './content';

export const metadata: Metadata = {
  title: 'Word to PDF Converter | Convert DOCX to PDF Online',
  description: 'Convert Microsoft Word documents (DOCX) to PDF format securely in your browser.',
};

export default function WordToPdfConverterPage() {
  return <WordToPdfConverterContent />;
}