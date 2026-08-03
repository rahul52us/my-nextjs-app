import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "File Encryptor | Encrypt Files Online Securely",
  description: "Encrypt any file using AES encryption in your browser for secure sharing and storage.",
};

export default function Page() {
  return <ToolContent />;
}
