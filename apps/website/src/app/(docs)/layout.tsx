import type { Metadata } from 'next'

import { siteConfig } from '@/config/site'
import { fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { SiteFooter } from '@/components/site-footer'
import '../globals.css'
import './docs.css'
import './anatomy.css'
import { DocsHeader } from './_components/docs-header'
import { DocsSidebarNav } from './_components/docs-sidebar'

export const metadata: Metadata = {
  title: {
    default: 'Documentation',
    template: `%s — input-otp`,
  },
  metadataBase: new URL(siteConfig.url),
  description:
    'Documentation for input-otp — the accessible, unstyled, fully featured one-time-password input for React.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'input-otp',
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@guilherme_rodz' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function DocsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={cn(
          'min-h-[100dvh] bg-background font-sans antialiased',
          fontSans.className,
        )}
      >
        <DocsHeader />

        <div className="mx-auto flex max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-10 pr-6 lg:py-14">
              <DocsSidebarNav />
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 lg:border-l lg:border-border/50 lg:pl-10 xl:pl-14">
            {children}
          </main>
        </div>

        <SiteFooter />
      </body>
    </html>
  )
}
