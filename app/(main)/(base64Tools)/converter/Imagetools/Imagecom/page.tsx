import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Image Compressor | Reduce Image File Size Online",
  description: "Compress JPG, PNG, and WebP images online while maintaining high visual quality.",
};

export default function Page() {
  return <ToolContent />;
}
