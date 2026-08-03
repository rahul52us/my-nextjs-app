import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "JSON to Excel Converter | Convert JSON to XLSX",
  description: "Convert JSON objects and arrays into Microsoft Excel spreadsheets (XLSX) instantly.",
};

export default function Page() {
  return <ToolContent />;
}
