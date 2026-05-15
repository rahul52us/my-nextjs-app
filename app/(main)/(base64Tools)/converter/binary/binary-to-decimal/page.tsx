import type { Metadata } from 'next';
import BinaryToDecimalContent from './content';

export const metadata: Metadata = {
  title: 'Binary to Decimal Converter | Convert Binary to Numbers Online',
  description: 'Convert binary strings to decimal numbers instantly. Free online Binary to Decimal converter tool for developers.',
};

export default function BinaryToDecimalPage() {
  return <BinaryToDecimalContent />;
}
