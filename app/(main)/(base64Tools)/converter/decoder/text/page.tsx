import type { Metadata } from 'next';
import Base64ToTextContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to Text Decoder | Convert Base64 Strings to Text',
  description: 'Convert Base64 encoded strings back to readable text instantly. Free online Base64 text decoder tool.',
};

export default function Base64ToTextPage() {
  return <Base64ToTextContent />;
}
