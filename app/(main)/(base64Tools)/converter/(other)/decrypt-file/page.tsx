import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "File Decryptor | Decrypt Encrypted Files Online",
  description: "Decrypt AES-encrypted files securely in your web browser with password protection.",
};

export default function Page() {
  return <ToolContent />;
}
