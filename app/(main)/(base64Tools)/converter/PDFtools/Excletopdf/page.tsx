import type { Metadata } from 'next';
import ExcelToPdfContent from './content';

export const metadata: Metadata = {
  title: 'Excel to PDF Converter | Convert XLS/XLSX to PDF Online',
  description: 'Convert Excel spreadsheets (XLS, XLSX) to PDF format instantly in your browser. Secure, fast, and free online Excel to PDF converter.',
};

export default function ExcelToPdfPage() {
  return <ExcelToPdfContent />;
}