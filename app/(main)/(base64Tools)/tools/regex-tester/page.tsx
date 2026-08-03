import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Regex Tester & Debugger | Test Regular Expressions",
  description: "Test and debug JavaScript regular expressions with real-time match highlighting and substitution.",
};

export default function Page() {
  return <ToolContent />;
}
