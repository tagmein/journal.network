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

export function journal(
 theme: StarryUITheme,
 userName: string,
 journalName: string
): StarryUIPage {
 const themedPage = applyTheme(theme, page)
 return themedPage({
  title: 'Journal',
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
    mainArea.textContent =
     'details about the journal: ' +
     userName +
     ' - ' +
     journalName
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
