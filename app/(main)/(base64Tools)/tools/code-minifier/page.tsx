import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Code Minifier | Compress JS, CSS & HTML",
  description: "Minify JavaScript, CSS, and HTML code to reduce file size and increase webpage load speed.",
};

export default function Page() {
  return <ToolContent />;
}
