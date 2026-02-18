import type { Metadata } from 'next';
import ExcelToJsonContent from './content';

export const metadata: Metadata = {
  title: 'Excel to JSON - Online Excel Converter & Viewer | Developer Tools',
  description: 'Convert Excel files (XLS, XLSX) and Text files to JSON format. View, filter, and extract data from spreadsheets easily with our free online tool.',
};

export default function ExcelToJsonPage() {
  return <ExcelToJsonContent />;
}