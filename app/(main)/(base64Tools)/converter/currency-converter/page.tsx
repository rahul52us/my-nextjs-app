import type { Metadata } from 'next';
import CurrencyConverterContent from './content';

export const metadata: Metadata = {
  title: 'Currency Converter | USD, EUR, GBP, JPY, INR, CAD',
  description: 'Real-time currency exchange rate converter with calculation steps.',
};

export default function CurrencyConverterPage() {
  return <CurrencyConverterContent />;
}