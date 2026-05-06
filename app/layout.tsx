import type { Metadata } from 'next';
import { Unbounded, Kulim_Park } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
});

const kulimPark = Kulim_Park({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-kulim-park',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Liberalis Tracker',
  description: 'Liberalis Tracker',
  icons: {
    icon: '/website-logo.png', // Corrected path
    apple: '/website-logo.png', // Corrected path
  },
}; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var saved = localStorage.getItem('polytrack-theme');
                var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', saved || preferred);
              })();
            `,
          }}
        />
      </head>
      <body className={`${unbounded.variable} ${kulimPark.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}