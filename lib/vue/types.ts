import type { InputHTMLAttributes } from 'vue'

interface InputHTMLAttributes_ extends /* @vue-ignore */ InputHTMLAttributes {}

type OverrideProps<T, R> = Omit<
  T,
  // TODO: watch issue https://github.com/vuejs/core/issues/8286=
  // PS: I hate this line
  'autocomplete' | 'pattern' | 'disabled' | 'maxlength' | 'inputmode'
> &
  R

export type VueOTPInputProps = OverrideProps<
  InputHTMLAttributes_,
  {
    value?: string
    oncomplete?: (...args: any[]) => unknown

    // Overriding HTML input props
    autocomplete?: string
    pattern?: string
    disabled?: boolean
    maxlength: number
    inputmode?: 'numeric' | 'text'

    containerClass?: string
  }
>
