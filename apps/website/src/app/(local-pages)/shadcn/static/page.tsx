'use server'

import { default as ShadcnPage } from '../page'

export default async function StaticPage(pageProps: any) {
  return (
    <ShadcnPage {...pageProps} />
  )
}
