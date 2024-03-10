'use client'

import { ThemeProvider } from 'next-themes'

export function AppProvider({
  children,
  ...props
}: React.PropsWithChildren<{}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
