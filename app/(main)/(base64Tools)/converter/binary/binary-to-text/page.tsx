import type { Metadata } from 'next';
import BinaryToTextContent from './content';

export const metadata: Metadata = {
  title: 'Binary to Text Converter | Convert Binary to Text Online',
  description: 'Convert binary strings to readable text instantly. Free online Binary to Text converter tool for developers.',
};

export default function BinaryToTextPage() {
  return <BinaryToTextContent />;
}
