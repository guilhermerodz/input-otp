'use client'

import React from 'react'

export default function ShadcnPage() {
  const [value, setValue] = React.useState('')

  return (
    <form
      method="POST"
      className="container relative flex-1 flex flex-col justify-center items-center"
    >
      <input autoFocus type="password" autoComplete="username" />
    </form>
  )
}
