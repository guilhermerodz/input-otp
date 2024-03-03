import type { RenderProps } from '../core'

type OverrideProps<T, R> = Omit<T, keyof R> & R

export type ReactOTPInputProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value?: string
    onChange?: (...args: any[]) => unknown

    maxLength: number

    inputMode?: 'numeric' | 'text'

    onComplete?: (value: string) => void

    render: (props: RenderProps) => React.ReactElement

    containerClassName?: string
  }
>
