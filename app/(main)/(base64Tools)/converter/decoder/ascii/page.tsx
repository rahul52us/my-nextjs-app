import type { Metadata } from 'next';
import Base64ToAsciiContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to ASCII Converter | Decode Base64 Output Online',
  description: 'Convert Base64 encoded strings back to ASCII text instantly. Free online Base64 decoder tool for developers.',
};

export default function Base64ToAsciiPage() {
  return <Base64ToAsciiContent />;
}
