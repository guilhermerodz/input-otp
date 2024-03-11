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
  dark = true,
}: {
  code: string
  toCopy?: string
  dark?: boolean
}) {
  const highlightedCode = await highlightCode(code, dark)
  return (
    <div className={`relative code-example-${dark ? 'dark' : 'light'}`}>
      <pre
        dangerouslySetInnerHTML={{
          __html: highlightedCode,
        }}
      />

      {toCopy && (
        <div className="absolute top-4 right-6">
          <CopyButton value={toCopy} />
        </div>
      )}
    </div>
  )
}

async function highlightCode(code: string, dark: boolean) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      keepBackground: false,
      theme: dark ? 'vesper' : 'github-light',
    })
    .use(rehypeStringify)
    .process(code)

  return String(file)
}
