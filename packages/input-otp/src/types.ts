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

    /**
     * Called once when the value transitions from shorter than `maxLength`
     * to exactly `maxLength`. Receives the complete value as a string.
     *
     * Until 2.0.0 this was typed `(...args: any[]) => unknown`; the runtime
     * has always passed the single string. Handlers declaring extra or
     * non-string parameters no longer compile — see the 2.0.0 changelog
     * for the migration.
     */
    onComplete?: (value: string) => unknown
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
