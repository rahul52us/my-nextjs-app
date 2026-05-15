import type { Metadata } from 'next';
import TextToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'Text to Binary Converter | Convert Text to Binary Online',
  description: 'Convert any text string to binary representation instantly. Free online Text to Binary converter tool for developers.',
};

export default function TextToBinaryPage() {
  return <TextToBinaryContent />;
}
