import type { Metadata } from 'next';
import FileToBase64Content from './content';

export const metadata: Metadata = {
  title: 'File to Base64 Encoder | Convert Any File to Base64',
  description: 'Convert any file to Base64 encoded sring. Support for all file types. Output as Plain Text, Data URI, JSON, XML, or HTML.',
};

export default function FileToBase64Page() {
  return <FileToBase64Content />;
}
