// import type { InputHTMLAttributes } from 'vue'

type OverrideProps<T, R> = Omit<T, keyof R> & R

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
export enum SelectionType {
  CARET = 0,
  CHAR = 1,
  MULTI = 2,
}
export interface ContainerAttributes {
  'data-sel': string
  'data-is-hovering'?: string
  'data-is-focused'?: string
}

/** Frameworks */
// export type VueOTPInputProps = OverrideProps<
//   InputHTMLAttributes,
//   {
//     value?: string
//     onChange?: (newValue: string) => unknown

//     autocomplete?: string
//     pattern?: string
//     maxlength: number
//     inputmode?: 'numeric' | 'text'

//     // oncomplete?: (...args: any[]) => unknown

//     containerClass?: string
//   }
// >
export interface VueOTPInputProps {
  value?: string
  onChange?: (newValue: string) => unknown

  autocomplete?: string
  pattern?: string
  disabled?: boolean

  maxlength: number
  inputmode?: 'numeric' | 'text'

  // oncomplete?: (...args: any[]) => unknown

  containerClass?: string
}
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
