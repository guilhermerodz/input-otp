export interface SlotProps {
  isActive: boolean
  char: string | null
  hasFakeCaret: boolean
}
export interface RenderProps {
  slots: SlotProps[]
  isFocused: boolean
  isHovering: boolean
}
type OverrideProps<T, R> = Omit<T, keyof R> & R
export type OTPInputProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    value?: string
    onChange?: (newValue: string) => unknown

    maxLength: number

    textAlign?: 'left' | 'center' | 'right'
    inputMode?: 'numeric' | 'text'

    onComplete?: (...args: any[]) => unknown
    passwordManagerBehavior?: 'increase-width' | 'none'

    render: (props: RenderProps) => React.ReactElement

    containerClassName?: string
  }
>
export enum SelectionType {
  CARET = 0,
  CHAR = 1,
  MULTI = 2,
}
export interface Metadata {
  lastClickTimestamp: number
}
