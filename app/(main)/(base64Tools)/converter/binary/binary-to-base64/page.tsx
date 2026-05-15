import type { Metadata } from 'next';
import BinaryToBase64Content from './content';

export const metadata: Metadata = {
  title: 'Binary to Base64 Converter | Convert Binary to Base64 Online',
  description: 'Convert binary strings to Base64 encoded format instantly. Free online Binary to Base64 converter tool for developers.',
};

export default function BinaryToBase64Page() {
  return <BinaryToBase64Content />;
}
