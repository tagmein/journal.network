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
import { kvdbBrowser } from '../../components/kvdbBrowser'
import { User } from '../../lib/auth'

export function projects(
 theme: StarryUITheme
): StarryUIPage {
 const themedPage = applyTheme(
  theme,
  page
 )
 return themedPage({
  title: 'Projects',
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

   authGuard(
    mainArea,
    theme,
    (user: User) =>
     kvdbBrowser(
      theme,
      user,
      `users/${user.username}`
     )
   )

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
