'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { formAction } from './server/form-action'
import { ExampleComponent } from '../example-playground/component'

export default function ExampleAutoSubmit() {
  const formRef = React.useRef<HTMLFormElement>(null)

  const [value, setValue] = React.useState('12')

  return (
    <form ref={formRef} action={formAction}>
      <ExampleComponent
        name="otp"
        value={value}
        onChange={setValue}
        onComplete={() => formRef.current?.submit()}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
