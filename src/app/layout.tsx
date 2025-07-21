import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AnimatedLayout from "./AnimatedLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | NetWorth Tracker",
    default: "NetWorth Tracker | Track Your Financial Journey",
  },
  description:
    "Transform your financial future one asset at a time. Track net worth, monitor investments, and celebrate every milestone with our intuitive wealth tracking app.",
  openGraph: {
    title: "NetWorth Tracker | Track Your Financial Journey",
    description: "Transform your financial future one asset at a time.",
    url: "https://networthtracker.com",
    siteName: "NetWorth Tracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetWorth Tracker | Track Your Financial Journey",
    description: "Transform your financial future one asset at a time.",
  },
};

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "NetWorth Tracker",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Android, iOS",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "2500",
              },
              description: "Track your financial journey with our intuitive net worth tracking app",
            }),
          }}
        />
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
