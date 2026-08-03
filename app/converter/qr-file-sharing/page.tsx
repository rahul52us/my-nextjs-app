import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "QR File Sharing | Share Files via QR Code",
  description: "Share files across devices instantly using generated QR codes.",
};

export default function Page() {
  return <ToolContent />;
}
