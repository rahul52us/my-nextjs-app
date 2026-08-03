import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Watermark | Add Watermark to PDF",
  description: "Add text or image watermarks to PDF pages with custom opacity, angle, and position.",
};

export default function Page() {
  return <ToolContent />;
}
