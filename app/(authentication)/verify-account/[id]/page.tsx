import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Verify Account | Toolsahayata",
  description: "Verify your email address to activate your Toolsahayata account.",
};

export default function Page() {
  return <ToolContent />;
}
