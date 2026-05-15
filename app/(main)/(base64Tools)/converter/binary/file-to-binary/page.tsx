import type { Metadata } from 'next';
import FileToBinaryContent from './content';

export const metadata: Metadata = {
  title: 'File to Binary Converter | Convert File Contents to Binary Online',
  description: 'Convert file contents to binary representation instantly. Free online File to Binary converter tool for developers.',
};

export default function FileToBinaryPage() {
  return <FileToBinaryContent />;
}
