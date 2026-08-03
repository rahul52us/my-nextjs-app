import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "AI Chatbot Assistant | Smart Conversational Helper",
  description: "Chat with our AI assistant for coding help, content generation, and instant answers.",
};

export default function Page() {
  return <ToolContent />;
}
