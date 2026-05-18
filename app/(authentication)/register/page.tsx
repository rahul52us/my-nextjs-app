import type { Metadata } from 'next';
import RegisterContent from './content';

export const metadata: Metadata = {
  title: 'Register | Toolsahayata',
  description: 'Create a new Toolsahayata account and start building powerful workflows.',
};

export default function RegisterPage() {
  return <RegisterContent />;
}
