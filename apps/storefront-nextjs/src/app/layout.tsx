import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Commerce Store | Premium Products',
  description: 'Discover quality products at competitive prices. Fast shipping, secure checkout, excellent customer service.',
  keywords: 'ecommerce, shopping, products',
  openGraph: {
    type: 'website',
    url: 'https://example.com',
    title: 'E-Commerce Store',
    description: 'Discover quality products at competitive prices',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
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
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 0 0% 3.6%;
            --border: 0 0% 89.8%;
            --input: 0 0% 89.8%;
            --ring: 0 0% 3.6%;
            --primary: 0 0% 9%;
            --primary-foreground: 0 0% 100%;
            --secondary: 0 0% 96.1%;
            --secondary-foreground: 0 0% 9%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 0 0% 100%;
            --muted: 0 0% 96.1%;
            --muted-foreground: 0 0% 45.1%;
            --accent: 0 0% 9%;
            --accent-foreground: 0 0% 100%;
            --radius: 0.5rem;
          }
        `}</style>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
