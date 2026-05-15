import type { Metadata } from 'next';
import DecimalToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'Decimal to Binary Converter | Convert Numbers to Binary Online',
  description: 'Convert decimal numbers to binary representation instantly. Free online Decimal to Binary converter tool for developers.',
};

export default function DecimalToBinaryPage() {
  return <DecimalToBinaryContent />;
}
