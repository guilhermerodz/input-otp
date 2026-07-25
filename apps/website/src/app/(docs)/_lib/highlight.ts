import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypePrettyCode from 'rehype-pretty-code'

/**
 * Syntax-highlight a bare source string at build time.
 *
 * rehype-pretty-code operates on markdown code fences, so we wrap the source
 * in one. `keepBackground: false` lets the docs surface own the background.
 */
export async function highlight(code: string, lang = 'tsx') {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, { keepBackground: false, theme: 'vesper' })
    .use(rehypeStringify)
    .process(`\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``)

  return String(file)
}
