import type { Metadata } from 'next';
import AsciiToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'ASCII to Binary Converter | Convert ASCII to Binary Online',
  description: 'Convert ASCII characters to binary representation instantly. Free online ASCII to Binary converter tool for developers.',
};

export default function AsciiToBinaryPage() {
  return <AsciiToBinaryContent />;
}
