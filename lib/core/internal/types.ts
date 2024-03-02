import type { ContainerAttributes } from '../types'

export interface UserDefinedMetadata {
  maxLength: number
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  regexp?: RegExp
  updateMirror: <
    K extends keyof ContainerAttributes,
    V extends ContainerAttributes[K],
  >(
    key: K,
    value: V,
  ) => void
}
export interface InternalMetadata {
  lastClickTimestamp: number | undefined
  previousRegisteredValue: string

  unmount?: () => void
}
export type Metadata = UserDefinedMetadata & InternalMetadata
export type HTMLInputElementWithMetadata = HTMLInputElement & {
  __metadata__: Metadata
}
export type EventToListenerMap = Partial<{
  [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => any
}>
