import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Image Text Extractor | Extract Text from Images (OCR)",
  description: "Extract text content from images, screenshots, and scanned documents instantly using optical character recognition.",
};

export default function Page() {
  return <ToolContent />;
}
