'use client'

import * as React from 'react'

export default function OtherPage() {
  const [value, setValue] = React.useState<string>('')

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <Input value={value} setValue={setValue} />
    </div>
  )
}

type InputProps = {
  value: string
  setValue: (value: string) => void
}
function Input({ value, setValue, ...props }: InputProps) {
  /** States, Refs and Memos */

  /** Effects */
  function handleInputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {}
  function handleInputKeyDown(e: React.KeyboardEvent) {}
  function handleInputSelect(e: React.SyntheticEvent<HTMLInputElement>) {}
  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {}
  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {}
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {}

  /** Render */
  return (
    <input className="w-1/2 h-12" value={value} onChange={handleInputChange} />
  )
}
