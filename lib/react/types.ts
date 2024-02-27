import type { RenderProps } from '.'

type OverrideProps<T, R> = Omit<T, keyof R> & R

export type ReactOTPInputProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value?: string
    onChange?: (newValue: string) => unknown

    maxLength: number

    inputMode?: 'numeric' | 'text'

    onComplete?: (...args: any[]) => unknown

    render: (props: RenderProps) => React.ReactElement

    containerClassName?: string
  }
>
