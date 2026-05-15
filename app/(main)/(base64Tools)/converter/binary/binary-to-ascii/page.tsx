import type { Metadata } from 'next';
import BinaryToAsciiContent from './content';

export const metadata: Metadata = {
  title: 'Binary to ASCII Converter | Convert Binary to ASCII Online',
  description: 'Convert binary strings to ASCII characters instantly. Free online Binary to ASCII converter tool for developers.',
};

export default function BinaryToAsciiPage() {
  return <BinaryToAsciiContent />;
}
