import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Online OCR Scanner | Extract Text from PDF & Images",
  description: "Convert scanned PDF documents and images into editable text with online Optical Character Recognition.",
};

export default function Page() {
  return <ToolContent />;
}
