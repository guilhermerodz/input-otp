
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '../../components/provider'
import { fontSans } from '../../lib/fonts'
import { cn } from '../../lib/utils'
import '../globals.css'
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
            {/* <HydrationOverlay> */}
            <main className="flex-1 flex flex-col">{children}</main>
            {/* </HydrationOverlay> */}
          </div>
        </AppProvider>

        <Toaster />
      </body>
    </html>
  )
}
