import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Data Visualizer | Interactive Chart & Graph Creator",
  description: "Visualize JSON, CSV, or raw numerical data into interactive charts and graphs online.",
};

export default function Page() {
  return <ToolContent />;
}
