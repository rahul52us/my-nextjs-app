import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "PDF Signer | Sign PDF Documents Online",
  description: "Add digital signature or drawn signature to PDF files securely online.",
};

export default function Page() {
  return <ToolContent />;
}
