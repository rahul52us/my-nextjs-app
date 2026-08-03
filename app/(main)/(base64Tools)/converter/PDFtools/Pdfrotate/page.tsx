import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Rotator | Rotate PDF Pages Online",
  description: "Rotate individual pages or entire PDF files clockwise or counter-clockwise online.",
};

export default function Page() {
  return <ToolContent />;
}
