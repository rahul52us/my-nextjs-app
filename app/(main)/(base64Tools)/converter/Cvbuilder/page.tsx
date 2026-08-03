import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "CV & Resume Builder | Create Professional Resumes",
  description: "Build and download professional resumes and CVs online with modern design templates.",
};

export default function Page() {
  return <ToolContent />;
}
