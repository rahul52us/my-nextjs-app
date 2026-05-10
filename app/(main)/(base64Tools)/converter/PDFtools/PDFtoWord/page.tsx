import type { Metadata } from 'next';
import PDFToWordContent from './content';

export const metadata: Metadata = {
    title: 'Toolsahayata PDF to Word Converter - Free Online PDF to DOCX',
    description: 'Convert PDF to Word online for free with Toolsahayata. Secure, fast, browser-based PDF to DOCX converter. No files sent to server.',
    keywords: ['pdf to word', 'pdf to docx', 'free pdf converter', 'online pdf to word', 'toolsahayata pdf converter'],
    openGraph: {
        title: 'Toolsahayata PDF to Word Converter',
        description: 'Free online PDF to Word conversion tool by Toolsahayata. Convert PDF files to editable Word documents instantly.',
        url: 'https://www.toolsahayata.com/converter/PDFtools/PDFtoWord',
        siteName: 'Toolsahayata',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Toolsahayata PDF to Word Converter',
        description: 'Convert PDF to Word online for free. Secure and fast conversion.',
    },
    alternates: {
        canonical: 'https://www.toolsahayata.com/converter/PDFtools/PDFtoWord',
    },
};

export default function PDFToWordPage() {
    return <PDFToWordContent />;
}