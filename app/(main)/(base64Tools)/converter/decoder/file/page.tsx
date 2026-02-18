import type { Metadata } from 'next';
import Base64ToFileContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to File Converter | Decode & Preview Files Online',
  description: 'Convert Base64 strings to files. Preview images, PDFs, and Excel spreadsheets directly in your browser before downloading.',
};

export default function Base64ToFilePage() {
  return <Base64ToFileContent />;
}