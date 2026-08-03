import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "CSS to SCSS Converter | Convert CSS to SASS/SCSS",
  description: "Convert raw CSS code to nested, clean SCSS/SASS syntax online.",
};

export default function Page() {
  return <ToolContent />;
}
