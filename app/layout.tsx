import type { Metadata } from 'next';
import { WEBSITE_TITLE, WEBSITE_DESCRIPTION, KEYWORDS, SITE_URL } from './config/utils/variables';
import ClientRootLayout from './ClientRootLayout';
import './globals.css';
import { lato } from './theme/fonts';

export const metadata: Metadata = {
  title: {
    default: WEBSITE_TITLE || 'My App',
    template: `%s | ${WEBSITE_TITLE || 'My App'}`,
  },
  description: WEBSITE_DESCRIPTION || 'My App Description',
  keywords: KEYWORDS || ['Next.js', 'React', 'Application'],
  openGraph: {
    title: WEBSITE_TITLE || 'My App',
    description: WEBSITE_DESCRIPTION || 'My App Description',
    url: SITE_URL,
    siteName: WEBSITE_TITLE || 'My App',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: WEBSITE_TITLE || 'My App',
    description: WEBSITE_DESCRIPTION || 'My App Description',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lato.variable}>
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
