import { Marked } from '@ts-stack/markdown'
import hljs from 'highlight.js/lib/core'
import hljsLanguageShell from 'highlight.js/lib/languages/shell'
import hljsLanguageTypeScript from 'highlight.js/lib/languages/typescript'

import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage(
 'shell',
 hljsLanguageShell
)
hljs.registerLanguage(
 'typescript',
 hljsLanguageTypeScript
)

Marked.setOptions({
 highlight(
  code,
  language = 'typescript'
 ) {
  return hljs.highlight(code, {
   language,
  }).value
 },
})

export async function renderMarkdownFromPath(
 path: string
): Promise<string> {
 const response = await fetch(path)
 const source = await response.text()
 return Marked.parse(source)
}
