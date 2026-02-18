import type { Metadata } from 'next';
import BaseConverterContent from './content';

export const metadata: Metadata = {
  title: 'Base Converter | Binary, Octal, Decimal, Hex',
  description: 'Convert numbers between Binary, Octal, Decimal, and Hexadecimal systems.',
};

export default function BaseConverterPage() {
  return <BaseConverterContent />;
}
