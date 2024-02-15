'use client'

import * as React from 'react'
import { cn } from '../../util/cn'
import { Controller, useForm } from 'react-hook-form'
import { OTPInput } from '@/app/component'

type FormValues = {
  otp: string
}

export default function ExampleReactHookForm() {
  const [formDisabled, setFormDisabled] = React.useState(false)

  const { control, handleSubmit, setFocus } = useForm<FormValues>({
    defaultValues: {
      otp: '',
    },
    disabled: formDisabled,
  })

  React.useEffect(() => {
    setFocus('otp')
  }, [setFocus])

  function onSubmit(values: FormValues) {
    console.log({ values })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gradient-to-tr from-black to-slate-900 min-w-screen min-h-screen text-white items-center justify-center flex flex-col"
    >
      <div className="mb-10 text-6xl font-bold tracking-tighter">react-otp-input</div>

      <Controller
        name="otp"
        control={control}
        render={({ field }) => (
          <OTPInput
            {...field}
            maxLength={6}
            regexp={null}
            render={({ triggerProps, slots, isFocused, paddedValue }) => (
              <button {...triggerProps} className="flex gap-2">
                {slots.map((slot, slotIdx) => (
                  <div
                    key={slotIdx}
                    className={cn(
                      'w-10 h-14 flex items-center justify-center border-gray-500 border rounded-md',
                      {
                        'border-white': isFocused,
                        'border-[4px] border-blue-400': slot.isActive,
                        'opacity-50': field.disabled,
                      },
                    )}
                  >
                    {slot.char || ' '}

                    {/* TODO: add fake caret */}
                  </div>
                ))}
              </button>
            )}
          />
        )}
      />
    </form>
  )
}
