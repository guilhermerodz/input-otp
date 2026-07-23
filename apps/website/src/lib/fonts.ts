// import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google"
import {
  JetBrains_Mono as FontMono,
  Architects_Daughter as FontHand,
} from 'next/font/google'
// import { GeistMono } from "geist/font/mono"
import { GeistSans } from 'geist/font/sans'

// export const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// })
export const fontSans = GeistSans

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
})

/** Hand-drawn annotation voice for the "how it's built" story. */
export const fontHand = FontHand({
  subsets: ['latin'],
  weight: '400',
})
