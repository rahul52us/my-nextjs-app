import type { Metadata } from 'next';
import Base64ToHexContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to Hex Converter | View Binary Data in Hexadecimal',
  description: 'Convert Base64 encoded data to Hexadecimal format. Useful for debugging binary data, cryptographic keys, and more.',
};

export default function Base64ToHexPage() {
  return <Base64ToHexContent />;
}
