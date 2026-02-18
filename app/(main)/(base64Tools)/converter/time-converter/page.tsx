import type { Metadata } from 'next';
import TimeConverterContent from './content';

export const metadata: Metadata = {
  title: 'Time Converter | Seconds, Minutes, Hours, Days, Weeks',
  description: 'Convert time units instantly with precision.',
};

export default function TimeConverterPage() {
  return <TimeConverterContent />;
}