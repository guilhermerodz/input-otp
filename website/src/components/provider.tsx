// 'use client'

export function AppProvider({
  children,
  ...props
}: React.PropsWithChildren<{}>) {
  return <>{children}</>
}
