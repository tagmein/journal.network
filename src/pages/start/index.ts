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
import { authGuard } from '../../components/authGuard'
import { User } from '../../lib/auth'

export function start(
 theme: StarryUITheme
): StarryUIPage {
 const themedPage = applyTheme(theme, page)
 return themedPage({
  title: 'Start',
  content(container, config) {
   const themedColumn = applyTheme(
    theme,
    column
   )
   const mainArea = themedColumn({
    themeFacets: ['document', 'opaque'],
   })
   container.appendChild(mainArea)
   const themeVariablesStyle:
    | HTMLStyleElement
    | undefined = attachThemeVariables(
    mainArea,
    theme.variables
   )

   authGuard(mainArea, theme, (user: User) => {
    const element =
     document.createElement('div')
    element.style.padding = 'var(--dimension4)'
    element.textContent =
     'Journals list will be displayed here'
    return {
     element,
     destroy() {
      element.remove()
     },
    }
   })

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
