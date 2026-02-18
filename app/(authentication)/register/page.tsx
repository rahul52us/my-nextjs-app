import type { Metadata } from 'next';
import RegisterContent from './content';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return <RegisterContent />;
}
