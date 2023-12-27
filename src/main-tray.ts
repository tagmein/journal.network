import {
 button,
 withButtonImage,
} from '@starryui/button'
import { row } from '@starryui/layout'
import {
 attachMenu,
 menu,
} from '@starryui/menu'
import { StarryUIPage } from '@starryui/page'
import {
 StarryUITheme,
 applyTheme,
 attachThemeFacet,
 attachThemeVariables,
} from '@starryui/theme'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import {
 tray,
 traySpacer,
} from '@starryui/tray'

export interface MainTrayControl {
 container: HTMLElement
 destroy(): Promise<void>
 theme: StarryUITheme
 withBreadcrumb(
  path: string,
  page: StarryUIPage,
  prefixBreadcrumbs?: {
   title: string
   url: string
  }[]
 ): StarryUIPage
}

export function mainTray(
 theme: StarryUITheme,
 allThemes: StarryUITheme[],
 onChangeTheme: (
  newTheme: StarryUITheme
 ) => Promise<void>
): MainTrayControl {
 const themedButton = applyTheme(theme, button)
 const themedMenu = applyTheme(theme, menu)
 const themedRow = applyTheme(theme, row)
 const themedTray = applyTheme(theme, tray)

 const container = themedTray({
  style: {
   zIndex: '1',
  },
 })

 container.appendChild(
  themedButton.add(
   withButtonImage('/journal-network-logo.png'),
   withTextContent('Journal Network')
  )({ href: '/#', tagName: 'a' })
 )
 const breadcrumbs = themedRow()
 container.appendChild(breadcrumbs)
 container.appendChild(traySpacer(theme))

 const attachedStyleSheets: (
  | HTMLElement
  | undefined
 )[] = []

 attachedStyleSheets.push(
  attachThemeVariables(
   container,
   theme.variables
  )
 )

 const themeSwitcher =
  document.createElement('div')

 attachThemeFacet(
  themeSwitcher,
  theme,
  'button'
 )
 themeSwitcher.textContent = theme.name
 attachMenu(
  themeSwitcher,
  themedMenu.add({
   type: 'onSelect',
   onSelect(selectedThemeName) {
    const selectedTheme = allThemes.find(
     (x) => x.name === selectedThemeName
    )
    if (selectedTheme) {
     onChangeTheme(selectedTheme)
    }
   },
  })({
   content(container) {
    for (const theme of allThemes) {
     const pickTheme =
      document.createElement('div')
     pickTheme.textContent = theme.name
     pickTheme.setAttribute(
      'data-value',
      theme.name
     )
     container.appendChild(pickTheme)
    }
   },
  })
 )

 container.appendChild(themeSwitcher)
 container.appendChild(
  themedButton.add(
   withClick(function toggleFullscreen() {
    if (!document.fullscreenElement) {
     document.body.requestFullscreen()
    } else {
     if (document.exitFullscreen) {
      document.exitFullscreen()
     }
    }
   }),
   withTextContent('⛶')
  )({
   style: {
    lineHeight: '16px',
    minWidth: '29px',
    width: '29px',
   },
  })
 )

 function withBreadcrumb(
  path: string,
  page: StarryUIPage,
  prefixBreadcrumbs: {
   title: string
   url: string
  }[] = []
 ): StarryUIPage {
  for (const prefixBreadcrumb of prefixBreadcrumbs) {
   const crumb = themedButton.add(
    withTextContent(prefixBreadcrumb.title)
   )({
    href: prefixBreadcrumb.url,
    tagName: 'a',
   })
   page.startUpTasks.initial.push(function () {
    crumb.setAttribute(
     'data-starryui-reveal',
     'hidden'
    )
    breadcrumbs.appendChild(crumb)
   })
   page.startUpTasks.final.push(function () {
    crumb.setAttribute(
     'data-starryui-reveal',
     'reveal'
    )
   })
   page.cleanUpTasks.initial.push(function () {
    crumb.setAttribute(
     'data-starryui-reveal',
     'hidden'
    )
   })
   page.cleanUpTasks.final.push(function () {
    breadcrumbs.removeChild(crumb)
   })
  }
  const crumb = themedButton.add(
   withTextContent(page.title)
  )({
   href: path,
   tagName: 'a',
  })
  page.startUpTasks.initial.push(function () {
   crumb.setAttribute(
    'data-starryui-reveal',
    'hidden'
   )
   breadcrumbs.appendChild(crumb)
  })
  page.startUpTasks.final.push(function () {
   crumb.setAttribute(
    'data-starryui-reveal',
    'reveal'
   )
  })
  page.cleanUpTasks.initial.push(function () {
   crumb.setAttribute(
    'data-starryui-reveal',
    'hidden'
   )
  })
  page.cleanUpTasks.final.push(function () {
   breadcrumbs.removeChild(crumb)
  })
  return page
 }

 async function destroy() {
  attachedStyleSheets.forEach((sheet) =>
   sheet?.remove()
  )
  container.remove()
 }

 return {
  container,
  destroy,
  get theme() {
   return theme
  },
  withBreadcrumb,
 }
}
