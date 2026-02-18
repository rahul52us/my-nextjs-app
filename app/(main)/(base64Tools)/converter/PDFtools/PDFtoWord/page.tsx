"use client";
import type { Metadata } from 'next';
import PDFToWordContent from './content';

export const metadata: Metadata = {
  title: 'PDF to Word Converter | PDF Tools',
  description: 'Convert PDF files to editable Word (DOCX) documents instantly.',
};

export default function PDFToWordConverterPage() {
  return <PDFToWordContent />;
}
