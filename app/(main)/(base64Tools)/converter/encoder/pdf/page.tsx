import type { Metadata } from 'next';
import PdfToBase64Content from './content';

export const metadata: Metadata = {
    title: 'PDF to Base64 Encoder | Convert PDF Files to Base64',
    description: 'Convert PDF documents to Base64 encoded strings. Useful for embedding PDFs in web pages or data transmission.',
};

export default function PdfToBase64Page() {
    return <PdfToBase64Content />;
}
