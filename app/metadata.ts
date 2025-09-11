import { Metadata, Viewport } from 'next'

export const viewportConfig: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e40af',
}

export const siteMetadata: Metadata = {
  title: {
    default: 'Schachklub Kreis 4 Classical League',
    template: '%s | SK K4 Classical League'
  },
  description: 'Season 2 of the Schachklub Kreis 4 Classical Chess Tournament. Swiss system tournament with 7 rounds, 30+30 time control. Register now to participate!',
  keywords: ['chess', 'schach', 'tournament', 'turnier', 'classical chess', 'swiss system', 'Zürich', 'Kreis 4', 'Schachklub'],
  authors: [{ name: 'Schachklub Kreis 4' }],
  creator: 'Schachklub Kreis 4',
  publisher: 'Schachklub Kreis 4',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://classical.schachklub-k4.ch'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Schachklub Kreis 4 Classical League',
    description: 'Join Season 2 of our Classical Chess Tournament! Swiss system, 7 rounds, 30+30 time control. Register now!',
    url: 'https://classical.schachklub-k4.ch',
    siteName: 'SK K4 Classical League',
    locale: 'de_CH',
    type: 'website',
    images: [
      {
        url: '/sharing-image.png',
        width: 500,
        height: 500,
        alt: 'Schachklub Kreis 4 Classical League'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schachklub Kreis 4 Classical League',
    description: 'Join Season 2 of our Classical Chess Tournament! Swiss system, 7 rounds, 30+30 time control.',
    images: ['/sharing-image.png'],
  },
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}