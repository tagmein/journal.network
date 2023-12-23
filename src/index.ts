import {
 attachStyle,
 attachThemeVariables,
 useThemeDimensions,
} from '@starryui/theme'
import { themeMidnight } from '@starryui/theme-midnight'
import { mainTray } from './main-tray'
import { router } from './router'

const topTray = mainTray(
 () => route(),
 themeMidnight
)
const route = router(topTray)

attachThemeVariables(
 'body',
 themeMidnight.variables
)
attachStyle(
 themeMidnight,
 'body',
 themeMidnight.facets.body
)
useThemeDimensions.tiny()

route()
addEventListener('hashchange', route)
