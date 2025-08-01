import type { Metadata } from 'next';
import { Lato, Pirata_One } from 'next/font/google';
import './globals.css';
import AnimatedLayout from './AnimatedLayout';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    template: '%s | Tammy',
    default: 'Tammy | Track Your Financial Journey',
  },
  description:
    'Transform your financial future one asset at a time. Track net worth, monitor investments, and celebrate every milestone with our intuitive wealth tracking app.',
  openGraph: {
    title: 'Tammy | Track Your Financial Journey',
    description: 'Transform your financial future one asset at a time.',
    url: 'https://networthtracker.com',
    siteName: 'Tammy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tammy| Track Your Financial Journey',
    description: 'Transform your financial future one asset at a time.',
  },
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
      <body className={`${lato.variable} ${pirataOne.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Tammy',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Android, iOS',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '2500',
              },
              description: 'Track your financial journey with our intuitive net worth tracking app',
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
