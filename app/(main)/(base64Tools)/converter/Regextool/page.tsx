import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Regex Helper & Visualizer | Build & Test RegEx",
  description: "Construct, visualize, and test regular expressions with real-time matching and explanations.",
};

export default function Page() {
  return <ToolContent />;
}
