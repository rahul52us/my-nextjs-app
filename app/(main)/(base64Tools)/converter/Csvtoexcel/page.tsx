import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "CSV to Excel Converter | Convert CSV to XLSX",
  description: "Convert CSV files to Microsoft Excel (XLSX) format quickly and securely.",
};

export default function Page() {
  return <ToolContent />;
}
