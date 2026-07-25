import * as React from 'react'

import { readDemoSource } from '../_lib/source'
import { highlight } from '../_lib/highlight'
import { PreviewTabs } from './preview-tabs'

/**
 * Pairs a live demo with its own source file.
 *
 * `name` points at `(docs)/_demos/<name>.tsx`; the file is read and highlighted
 * at build time, which means the snippet a reader copies is byte-for-byte the
 * component they just interacted with. There is no second copy to fall behind.
 */
export async function ComponentPreview({
  name,
  children,
  align,
  contentClassName,
}: {
  name: string
  children: React.ReactNode
  align?: 'center' | 'start'
  contentClassName?: string
}) {
  const source = readDemoSource(name)
  const html = await highlight(source)

  return (
    <PreviewTabs
      preview={children}
      rawCode={source}
      align={align}
      contentClassName={contentClassName}
      code={<div dangerouslySetInnerHTML={{ __html: html }} />}
    />
  )
}
