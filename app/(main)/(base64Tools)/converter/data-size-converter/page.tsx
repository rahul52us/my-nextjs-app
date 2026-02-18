import type { Metadata } from 'next';
import DataSizeConverterContent from './content';

export const metadata: Metadata = {
  title: 'Data Size Converter | Bytes, KB, MB, GB, TB, PB',
  description: 'Convert data sizes between Bits, Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, and Petabytes.',
};

export default function DataSizeConverterPage() {
  return <DataSizeConverterContent />;
}