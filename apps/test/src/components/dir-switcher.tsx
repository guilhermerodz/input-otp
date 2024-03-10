'use client'

import React from 'react'

export function DirSwitcher() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>()
  const nextDir = dir !== 'rtl' ? 'rtl' : 'ltr'

  return (
    <div>
      <button
        onClick={() => {
          document.dir = nextDir
          setDir(nextDir)
        }}
      >
        change to {nextDir.toUpperCase()}
      </button>
    </div>
  )
}
