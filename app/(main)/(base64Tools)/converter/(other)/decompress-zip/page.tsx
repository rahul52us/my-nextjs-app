import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "ZIP Decompressor | Extract ZIP Files Online",
  description: "Extract and view files inside ZIP archives directly in your browser without uploading to any server.",
};

export default function Page() {
  return <ToolContent />;
}
