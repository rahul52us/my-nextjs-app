import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Image Editor | Crop, Resize & Edit Images Online",
  description: "Edit, crop, rotate, resize, and apply filters to images online directly in your browser.",
};

export default function Page() {
  return <ToolContent />;
}
