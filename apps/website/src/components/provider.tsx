'use client'

import { ThemeProvider } from 'next-themes'

export function AppProvider({
  children,
  ...props
}: React.PropsWithChildren<{}>) {
  return (
    <ThemeProvider
      enableSystem
      disableTransitionOnChange
      attribute="class"
      defaultTheme="system"
    >
      {children}
    </ThemeProvider>
  )
}
