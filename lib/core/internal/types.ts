export interface Metadata {
  lastClickTimestamp: number | undefined
  previousRegisteredValue: string
}
export type HTMLInputElementWithMetadata = HTMLInputElement & {
  __metadata__: Metadata
}
export type EventToListenerMap = Partial<{
  [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => any
}>
