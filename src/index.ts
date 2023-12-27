import {
 StarryUITheme,
 attachStyle,
 attachThemeVariables,
 useThemeDimensions,
} from '@starryui/theme'
import { themeMidnight } from '@starryui/theme-midnight'
import { mainTray } from './main-tray'
import { router } from './router'
import { themeSandstone } from '@starryui/theme-sandstone'
import { themeBrilliance } from '@starryui/theme-brilliance'

const attachedStyleSheets: (
 | HTMLElement
 | undefined
)[] = []

let hashChangeListener: undefined | (() => void)

const themeNameStorageKey = 'theme'

const storedThemeName = localStorage.getItem(
 themeNameStorageKey
)
const allThemes = [
 themeBrilliance,
 themeMidnight,
 themeSandstone,
]

async function main(theme: StarryUITheme) {
 const topTray = mainTray(
  theme,
  allThemes,
  async (newTheme) => {
   localStorage.setItem(
    themeNameStorageKey,
    newTheme.name
   )
   if (hashChangeListener) {
    removeEventListener(
     'hashchange',
     hashChangeListener
    )
   }
   await routerInstance.destroy()
   topTray.destroy()
   await main(newTheme)
  }
 )

 document.body.appendChild(topTray.container)

 attachedStyleSheets
  .splice(0, Infinity)
  .forEach((sheet) => sheet?.remove())

 const routerInstance = router(topTray)

 attachedStyleSheets.push(
  attachThemeVariables('body', theme.variables)
 )
 attachedStyleSheets.push(
  attachStyle(theme, 'body', theme.facets.body)
 )
 attachedStyleSheets.push(
  useThemeDimensions.tiny()
 )

 await routerInstance.route()
 hashChangeListener = routerInstance.route
 addEventListener(
  'hashchange',
  routerInstance.route
 )
}

const selectedTheme =
 allThemes.find(
  (x) => x.name === storedThemeName
 ) ?? themeMidnight

main(selectedTheme).catch((e) =>
 console.error(e)
)
