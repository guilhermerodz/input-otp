export interface SlotProps {
  isActive: boolean
  char: string | null
  placeholderChar: string | null
  hasFakeCaret: boolean
}
export interface RenderProps {
  slots: SlotProps[]
  isFocused: boolean
  isHovering: boolean
}
type OverrideProps<T, R> = Omit<T, keyof R> & R
type OTPInputBaseProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value?: string
    onChange?: (newValue: string) => unknown

    maxLength: number

    textAlign?: 'left' | 'center' | 'right'

    // Deliberately variadic until 2.0.0: narrowing to `(value: string)`
    // breaks compilation of handlers typed with extra or non-string params
    // (e.g. react-hook-form's `handleSubmit(onSubmit)` passed directly).
    onComplete?: (...args: any[]) => unknown
    pushPasswordManagerStrategy?: 'increase-width' | 'none'
    pasteTransformer?: (pasted: string) => string

    containerClassName?: string

    noScriptCSSFallback?: string | null

    nonce?: string
  }
>
type InputOTPRenderFn = (props: RenderProps) => React.ReactNode
export type OTPInputProps = OTPInputBaseProps &
  (
    | {
        render: InputOTPRenderFn
        children?: never
      }
    | {
        render?: never
        children: React.ReactNode
      }
  )
