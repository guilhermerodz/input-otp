import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './experiment.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'input-otp — Stop wasting time building OTP inputs',
  description:
    'One-time passcode input for React. Unstyled, accessible, and copy-paste friendly out of the box.',
  robots: { index: false },
}

export default function ExperimentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="xp-body">{children}</body>
    </html>
  )
}
