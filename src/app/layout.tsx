import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimatedLayout from "./AnimatedLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | Mejabi Durotimi Photography & Films",
    default: "Mejabi Durotimi | Wedding Photography & Videography Dublin",
  },
  description:
    "Creative and documentary wedding photography, videography, and event planning for modern couples in Dublin and across Ireland.",
  openGraph: {
    title: "Mejabi Durotimi | Wedding Photography & Videography Dublin",
    description: "Creative wedding photography and films.",
    url: "https://mejabidurotimi.com",
    siteName: "Mejabi Durotimi",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mejabi Durotimi | Wedding Photography & Videography Dublin",
    description: "Creative wedding photography and films.",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Mejabi Durotimi",
              image: "https://mejabidurotimi.com/logo.png",
              "@id": "https://mejabidurotimi.com",
              url: "https://mejabidurotimi.com",
              telephone: "+353-XX-XXX-XXXX",
              priceRange: "€€€",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Creative Street",
                addressLocality: "Dublin",
                postalCode: "D0X XXX",
                addressCountry: "IE",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 53.3498,
                longitude: -6.2603,
              },
              sameAs: [
                "https://www.instagram.com/your-instagram/",
                "https://www.facebook.com/your-facebook/",
              ],
            }),
          }}
        />
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
