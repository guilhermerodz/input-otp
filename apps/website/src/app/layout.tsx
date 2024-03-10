import type { Metadata } from 'next'

// import { HydrationOverlay } from '@builder.io/react-hydration-overlay'

import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'
import { siteConfig } from '../config/site'
import { fontSans } from '../lib/fonts'
import { cn } from '../lib/utils'
import './globals.css'
import { AppProvider } from '../components/provider'
import { Toaster } from '@/components/ui/sonner'

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
    <html lang="en">
      <body
        className={cn(
          'min-h-[100dvh] bg-background font-sans antialiased',
          fontSans.className,
        )}
      >
        <AppProvider>
          <div className="relative flex min-h-[100dvh] flex-col bg-background">
            <SiteHeader />

            {/* <HydrationOverlay> */}
              <main className="flex-1 flex flex-col">{children}</main>
            {/* </HydrationOverlay> */}

            <SiteFooter />
          </div>
        </AppProvider>

        <Toaster />
      </body>
    </html>
  )
}
