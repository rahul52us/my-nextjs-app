import type { Metadata } from 'next';
import LoginContent from './content';

export const metadata: Metadata = {
  title: 'Login | Toolsahayata',
  description: 'Login to your Toolsahayata account and access workflow tools securely.',
};

export default function LoginPage() {
  return <LoginContent />;
}
