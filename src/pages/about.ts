import { column } from '@starryui/layout'
import {
 StarryUIPage,
 page,
} from '@starryui/page'
import {
 StarryUITheme,
 applyTheme,
 attachThemeVariables,
} from '@starryui/theme'
import { renderMarkdownFromPath } from '../markdown'

export function about(
 theme: StarryUITheme
): StarryUIPage {
 const themedPage = applyTheme(
  theme,
  page
 )
 return themedPage({
  title: 'About',
  content(container, config) {
   const themedColumn = applyTheme(
    theme,
    column
   )
   const mainArea = themedColumn({
    style: {
     padding:
      'var(--dimension3) var(--dimension4)',
    },
    themeFacets: ['document', 'opaque'],
   })
   container.appendChild(mainArea)
   const themeVariablesStyle:
    | HTMLStyleElement
    | undefined = attachThemeVariables(
    mainArea,
    theme.variables
   )

   mainArea.textContent = 'loading...' // todo loading component

   async function load() {
    mainArea.innerHTML =
     await renderMarkdownFromPath(
      '/pages/about/content.md'
     )
   }

   load().catch((e) => console.warn(e))

   config?.startUpTasks?.initial?.push?.(
    function () {
     if (themeVariablesStyle) {
      document.head.appendChild(
       themeVariablesStyle
      )
     }
    }
   )

   config?.cleanUpTasks?.final?.push(
    function () {
     if (themeVariablesStyle) {
      document.head.removeChild(
       themeVariablesStyle
      )
     }
    }
   )
  },
 })
}
