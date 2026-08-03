import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Text Formatter & Case Converter | Format Plain Text",
  description: "Clean up text, change case, remove extra spaces, and format plain text online.",
};

export default function Page() {
  return <ToolContent />;
}
