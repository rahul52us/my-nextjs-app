import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Images to PDF Converter | Convert JPG & PNG to PDF",
  description: "Convert multiple images (JPG, PNG, WebP) into a single PDF document online.",
};

export default function Page() {
  return <ToolContent />;
}
