import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "QR Code Reader | Scan & Decode QR Codes Online",
  description: "Scan QR codes from webcam or upload image files to decode QR code contents instantly.",
};

export default function Page() {
  return <ToolContent />;
}
