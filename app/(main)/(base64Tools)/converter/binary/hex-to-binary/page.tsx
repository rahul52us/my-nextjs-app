import type { Metadata } from 'next';
import HexToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'Hex to Binary Converter | Convert Hexadecimal to Binary Online',
  description: 'Convert hexadecimal numbers to binary representation instantly. Free online Hex to Binary converter tool for developers.',
};

export default function HexToBinaryPage() {
  return <HexToBinaryContent />;
}
