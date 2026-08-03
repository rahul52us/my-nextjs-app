import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Resume Builder Pro | Professional CV Maker",
  description: "Create, customize, and export professional resumes with modern ATS-friendly templates.",
};

export default function Page() {
  return <ToolContent />;
}
