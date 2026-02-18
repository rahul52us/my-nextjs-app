import type { Metadata } from 'next';
import UrlToBase64Content from './content';

export const metadata: Metadata = {
  title: 'URL to Base64 Encoder | Convert Remote Files to Base64',
  description: 'Fetch files from a URL and convert them to Base64 encoded strings directly in your browser.',
};

export default function UrlToBase64Page() {
  return <UrlToBase64Content />;
}
