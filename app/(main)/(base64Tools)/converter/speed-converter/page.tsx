import type { Metadata } from 'next';
import SpeedConverterContent from './content';

export const metadata: Metadata = {
  title: 'Speed Converter | m/s, km/h, mph, ft/s, knots',
  description: 'Convert speed and velocity units instantly accurately.',
};

export default function SpeedConverterPage() {
  return <SpeedConverterContent />;
}