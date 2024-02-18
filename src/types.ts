export interface OTPInputRenderProps {
  slots: { isActive: boolean; char: string | null; hasFakeCaret: boolean }[]
  isFocused: boolean
  isHovering: boolean
}
type OverrideProps<T, R> = Omit<T, keyof R> & R
export type OTPInputProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value: string
    onChange: (...args: any[]) => unknown

    maxLength: number

    autoFocus?: boolean
    allowNavigation?: boolean
    inputMode?: 'numeric' | 'text'

    onComplete?: (...args: any[]) => unknown
    onBlur?: (...args: any[]) => unknown

    render: (props: OTPInputRenderProps) => React.ReactElement

    containerClassName?: string
  }
>
export enum SelectionType {
  CARET = 0,
  CHAR = 1,
  MULTI = 2,
}
