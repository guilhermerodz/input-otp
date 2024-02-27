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
