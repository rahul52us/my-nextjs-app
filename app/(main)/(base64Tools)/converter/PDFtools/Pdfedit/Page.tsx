"use client";
import type { Metadata } from 'next';
import AdvancedPDFEditorContent from './content';

export const metadata: Metadata = {
  title: 'PDF Editor | PDF Tools',
  description: 'Edit PDF files directly in your browser. Add text, shapes, images, and redactions.',
};

export default function AdvancedPDFEditorPage() {
  return <AdvancedPDFEditorContent />;
}