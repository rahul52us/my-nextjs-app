import type { Metadata } from 'next';
import BinaryToHexContent from './content';

export const metadata: Metadata = {
  title: 'Binary to Hex Converter | Convert Binary to Hexadecimal Online',
  description: 'Convert binary strings to hexadecimal representation instantly. Free online Binary to Hex converter tool for developers.',
};

export default function BinaryToHexPage() {
  return <BinaryToHexContent />;
}
