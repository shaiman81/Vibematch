import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FFF5F7',
};

export const metadata: Metadata = {
  title: 'VibeMatch - Connect & Match With Special People',
  description: 'VibeMatch - Interactive connect and matchmaking platform with profile registration, conversation topic selection, and real-time cloud sync.',
  verification: {
    google: 'l4k3oE7unvdhMS3ENSwiylitwjoMeLJRfPpOlN1RPms',
  },
  openGraph: {
    title: 'VibeMatch - Connect & Match With Special People',
    description: 'VibeMatch - Interactive connect and matchmaking platform with profile registration, conversation topic selection, and real-time cloud sync.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeMatch - Connect & Match With Special People',
    description: 'VibeMatch - Interactive connect and matchmaking platform with profile registration, conversation topic selection, and real-time cloud sync.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Google tag (gtag.js) for Google Ads & Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5K68Q2N02M"
        />
        <Script
          id="google-tags"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18050605081');
              gtag('config', 'G-5K68Q2N02M');
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

