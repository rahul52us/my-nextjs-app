import type { Metadata } from 'next';
import AsciiToBase64Content from './content';

export const metadata: Metadata = {
  title: 'ASCII to Base64 Encoder | Convert Text to Base64 Online',
  description: 'Convert ASCII text to Base64 encoded strings instantly. Free online ASCII to Base64 encoder tool for developers.',
};

export default function AsciiToBase64Page() {
  return <AsciiToBase64Content />;
}
