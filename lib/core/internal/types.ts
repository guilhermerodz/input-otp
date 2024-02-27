export interface Metadata {
  lastClickTimestamp: number
}
export type HTMLInputElementWithMetadata = HTMLInputElement & {
  __metadata__?: Metadata
}
export type EventToListenerMap = Partial<{
  [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => any
}>
