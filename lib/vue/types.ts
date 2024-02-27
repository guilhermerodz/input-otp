import type { InputHTMLAttributes } from 'vue'

interface InputHTMLAttributes_ extends /* @vue-ignore */ InputHTMLAttributes {}

type OverrideProps<T, R> = Omit<T, keyof R> & R

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
