'use client'

import * as React from 'react'

export function CopyCommand() {
  const [copied, setCopied] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px solid #27272a',
        background: '#101012',
        borderRadius: 999,
        padding: '13px 22px',
        fontSize: 14,
        fontWeight: 500,
      }}
      className="xp-mono"
    >
      <span style={{ color: '#71717a' }}>$</span> npm install input-otp
      <button
        type="button"
        className="xp-copy-btn"
        aria-label="Copy install command"
        onClick={() => {
          navigator.clipboard.writeText('npm install input-otp')
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
