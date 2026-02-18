import type { Metadata } from 'next';
import JsonFormatterContent from './content';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator | Beautify and Debug JSON Online',
  description: 'Format, validate, and beautify your JSON data instantly. Our free online JSON formatter highlights errors and structures your data for better readability.',
};

export default function JsonFormatterPage() {
  return <JsonFormatterContent />;
}
