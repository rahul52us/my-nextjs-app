import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Image Format Converter | Convert Image Types Online",
  description: "Convert images between JPG, PNG, WEBP, GIF, and BMP formats instantly.",
};

export default function Page() {
  return <ToolContent />;
}
