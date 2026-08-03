import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Editor | Edit PDF Files Online",
  description: "Edit text, add shapes, insert images, and sign PDF documents online for free.",
};

export default function Page() {
  return <ToolContent />;
}
