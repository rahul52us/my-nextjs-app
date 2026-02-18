import type { Metadata } from 'next';
import HomeContent from './content';

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder | Developer Toolkit',
  description: 'Simple Base64 encoding and decoding tool for developers.',
};

export default function HomePage() {
  return <HomeContent />;
}