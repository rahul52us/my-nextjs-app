import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Splitter | Extract Pages from PDF",
  description: "Split a large PDF file into individual pages or custom page ranges.",
};

export default function Page() {
  return <ToolContent />;
}
