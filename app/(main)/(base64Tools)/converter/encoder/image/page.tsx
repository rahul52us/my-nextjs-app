import type { Metadata } from 'next';
import ImageToBase64Content from './content';

export const metadata: Metadata = {
  title: 'Image to Base64 Encoder | Convert Images to Base64 Strings',
  description: 'Convert images (PNG, JPG, BMP, etc.) to Base64 encoded strings. Useful for embedding images in HTML, CSS, or JSON.',
};

export default function ImageToBase64Page() {
  return <ImageToBase64Content />;
}