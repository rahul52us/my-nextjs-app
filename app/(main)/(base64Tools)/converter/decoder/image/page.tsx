import type { Metadata } from 'next';
import Base64ImageContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to Image Decoder | Convert Base64 Strings to Images',
  description: 'Convert Base64 encoded strings to images (PNG, JPG, GIF, etc.) instantly in your browser. Preview and download decoded images.',
};

export default function Base64ImagePage() {
  return <Base64ImageContent />;
}