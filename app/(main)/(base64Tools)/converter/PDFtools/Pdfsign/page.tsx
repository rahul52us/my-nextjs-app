import type { Metadata } from 'next';
import PdfSignatureContent from './content';

export const metadata: Metadata = {
  title: 'PDF Signature | PDF Tools',
  description: 'Sign PDF documents securely in your browser. Draw or type your signature.',
};

export default function PdfSignaturePage() {
  return <PdfSignatureContent />;
}