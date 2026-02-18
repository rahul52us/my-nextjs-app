import type { Metadata } from 'next';
import UnitConverterContent from './content';

export const metadata: Metadata = {
  title: 'Unit Converter | Length, Weight, Temperature, Area, Volume',
  description: 'Convert between various units of measurement including length, weight, temperature, and more.',
};

export default function UnitConverterPage() {
  return <UnitConverterContent />;
}
