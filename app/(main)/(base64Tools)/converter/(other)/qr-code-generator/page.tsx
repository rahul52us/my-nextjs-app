import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "QR Code Generator | Create Custom QR Codes",
  description: "Create custom QR codes for URLs, text, Wi-Fi, and contacts with custom colors and logo options.",
};

export default function Page() {
  return <ToolContent />;
}
