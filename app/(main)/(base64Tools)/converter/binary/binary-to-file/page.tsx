import type { Metadata } from 'next';
import BinaryToFileContent from './content';

export const metadata: Metadata = {
  title: 'Binary to File Converter | Convert Binary Data to File Online',
  description: 'Convert binary data to files instantly. Free online Binary to File converter tool for developers.',
};

export default function BinaryToFilePage() {
  return <BinaryToFileContent />;
}
