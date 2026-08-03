import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Excel to CSV Converter | Convert XLSX to CSV",
  description: "Convert Excel spreadsheets (XLSX, XLS) into standard CSV format online.",
};

export default function Page() {
  return <ToolContent />;
}
