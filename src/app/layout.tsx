import type { Metadata, Viewport } from 'next';
import { Lato, Pirata_One } from 'next/font/google';
import './globals.css';
import AnimatedLayout from './AnimatedLayout';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF7F50',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://networthtracker.com'),
  title: {
    template: '%s | Tammy',
    default: 'Tammy | Track Your Financial Journey to FIRE',
  },
  description:
    'All-in-one FIRE tracking app for financial independence. Track net worth, calculate retirement timeline, manage budgets, and reach your freedom goals faster.',
  keywords: [
    'FIRE calculator',
    'financial independence',
    'net worth tracker',
    'retirement calculator',
    'budget tracker',
    'wealth management',
    'asset tracking',
    'personal finance app',
    'early retirement',
    'financial freedom',
  ],
  authors: [{ name: 'Timmy Mejabi' }],
  creator: 'Timmy Mejabi',
  publisher: 'Tammy Finance',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Tammy | Track Your Financial Journey to FIRE',
    description:
      'All-in-one FIRE tracking app. Calculate retirement timeline, track net worth, manage budgets, and reach financial independence.',
    url: 'https://networthtracker.com',
    siteName: 'Tammy',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tammy - FIRE and Net Worth Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tammy | Track Your Financial Journey to FIRE',
    description:
      'All-in-one FIRE tracking app. Calculate retirement timeline, track net worth, and reach financial independence.',
    creator: '@createdbytimmy',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://networthtracker.com',
  },
  category: 'Finance',
};

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
});

const pirataOne = Pirata_One({
  variable: '--font-pirata',
  subsets: ['latin'],
  weight: '400',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv8JLqjZH4LWK1vz8w3E2lbXlQRJNf/8LlCvDrMDFBdV9q0/aJYLWaP8IJk+7H0k2H8j1q2FvzCgI9zVQ9yMg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${lato.variable} ${pirataOne.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Tammy',
              alternateName: 'Tammy Finance',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web, Android, iOS',
              url: 'https://networthtracker.com',
              description:
                'All-in-one FIRE tracking app for financial independence. Track net worth, calculate retirement timeline, manage budgets, and reach your freedom goals faster.',
              author: {
                '@type': 'Person',
                name: 'Timmy Mejabi',
                url: 'https://tiktok.com/@createdbytimmy',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '2500',
                bestRating: '5',
                worstRating: '1',
              },
              featureList: [
                'FIRE Calculator',
                'Net Worth Tracking',
                'Budget Management',
                'Asset Tracking',
                'Liability Management',
                'Financial Independence Timeline',
                'Multi-currency Support',
              ],
            }),
          }}
        />
        <Providers>
          <AnimatedLayout>{children}</AnimatedLayout>
        </Providers>
      </body>
    </html>
  );
}
