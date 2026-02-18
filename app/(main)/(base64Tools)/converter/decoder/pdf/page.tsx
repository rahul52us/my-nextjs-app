import type { Metadata } from 'next';
import Base64PdfContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to PDF Decoder | Convert Base64 Strings to PDF',
  description: 'Convert Base64 encoded strings to PDF documents instantly in your browser. Secure, fast, and free Base64 to PDF decoder.',
};

export default function Base64PdfPage() {
  return <Base64PdfContent />;
}
