
import { Toaster } from '@/components/ui/sonner'
import { fontSans } from '../../lib/fonts'
import { cn } from '../../lib/utils'
import '../globals.css'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={cn(
          'min-h-[100dvh] bg-background font-sans antialiased',
          fontSans.className,
        )}
      >
        <div className="relative flex min-h-[100dvh] w-full flex-col bg-background">
          {/* <HydrationOverlay> */}
          <main className="flex-1 flex flex-col">{children}</main>
          {/* </HydrationOverlay> */}
        </div>

        <Toaster />
      </body>
    </html>
  )
}
