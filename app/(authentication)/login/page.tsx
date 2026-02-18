import type { Metadata } from 'next';
import LoginContent from './content';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
};

export default function LoginPage() {
  return <LoginContent />;
}
