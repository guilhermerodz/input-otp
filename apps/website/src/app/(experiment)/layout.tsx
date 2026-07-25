import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import { siteConfig } from '../../config/site'
import '../globals.css'
import './experiment.css'
import './feature-bento.css'
import './stats-odometer.css'
import './reveal.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    'React',
    'one-time-code',
    'Input',
    'Next.js',
    'Tailwind CSS',
    'Server Components',
    'Accessible',
  ],
  authors: [
    {
      name: 'guilhermerodz',
      url: 'https://rodz.dev',
    },
  ],
  creator: 'guilhermerodz',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@guilherme_rodz',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="xp-body">
        {/* Runs before first paint: repeat visitors never see the intro
            overlay, not even for a frame. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{localStorage.getItem('xp-intro-seen')&&document.documentElement.classList.add('xp-intro-seen')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  )
}
