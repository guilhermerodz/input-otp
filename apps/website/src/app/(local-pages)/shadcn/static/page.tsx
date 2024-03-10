'use server'

import { ClientComp } from './client-component'

export default async function StaticPage() {
  return (
    <>
      <ClientComp />
    </>
  )
}
