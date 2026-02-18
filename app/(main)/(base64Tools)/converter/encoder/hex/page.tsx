import type { Metadata } from 'next';
import HexToBase64Content from './content';

export const metadata: Metadata = {
  title: 'Hex to Base64 Encoder | Convert Hexadecimal to Base64',
  description: 'Convert Hexadecimal strings to Base64 encoded strings. Free online Hex to Base64 encoder tool for developers.',
};

export default function HexToBase64Page() {
  return <HexToBase64Content />;
}
