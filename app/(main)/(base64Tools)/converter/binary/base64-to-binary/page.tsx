import type { Metadata } from 'next';
import Base64ToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to Binary Converter | Convert Base64 to Binary Online',
  description: 'Convert Base64 encoded strings to binary representation instantly. Free online Base64 to Binary converter tool for developers.',
};

export default function Base64ToBinaryPage() {
  return <Base64ToBinaryContent />;
}
