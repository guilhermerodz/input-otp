import * as React from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypePrettyCode from 'rehype-pretty-code'
import { CopyButton } from './copy-button'

export async function Code({
  code,
  toCopy,
}: {
  code: string
  toCopy?: string
}) {
  const highlightedCode = await highlightCode(code)
  return (
    <div className="relative">
      <pre
        dangerouslySetInnerHTML={{
          __html: highlightedCode,
        }}
      />

      {toCopy && <div className="absolute top-4 right-6">
        <CopyButton value={toCopy} />
      </div>}
    </div>
  )
}

async function highlightCode(code: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // keepBackground: true,
      theme: 'vesper',
    })
    .use(rehypeStringify)
    .process(code)

  return String(file)
}
