import { StarryUIPage } from '@starryui/page'
import { StarryUITheme } from '@starryui/theme'
import { NORMAL_DELAY_MS } from '@starryui/traits/constants.js'
import { MainTrayControl } from './main-tray'
import { about } from './pages/about'
import { home } from './pages/home'
import { projects } from './pages/projects'

export function router(
 topTray: MainTrayControl
) {
 let activePage: StarryUIPage | undefined

 const pageCache = new Map<
  string,
  StarryUIPage
 >()

 function loadPage(
  path: string,
  id: string,
  theme: StarryUITheme,
  param: string
 ) {
  switch (id) {
   case 'about':
    return topTray.withBreadcrumb(
     path,
     about(theme)
    )
   case 'home':
    return home(theme)
   case 'projects':
    return topTray.withBreadcrumb(
     path,
     projects(theme)
    )
   default:
    throw new Error(`Page '${id}' not found`)
  }
 }

 function getPage(
  path: string,
  id: string,
  theme: StarryUITheme,
  param: string
 ) {
  const cacheId = `<theme:${theme.name}><page:${id}><${param}>`
  if (pageCache.has(cacheId)) {
   return pageCache.get(cacheId)
  }
  const page = loadPage(path, id, theme, param)
  pageCache.set(cacheId, page)
  return page
 }

 async function route() {
  if (activePage) {
   activePage.element.setAttribute(
    'data-starryui-reveal',
    'hidden'
   )
   await activePage.onUnload?.(false)
   await new Promise((r) =>
    setTimeout(r, NORMAL_DELAY_MS)
   )
   document.body.removeChild(activePage.element)
   await activePage.onUnload?.(true)
   activePage = undefined
  }
  if (
   location.hash.match(/#\/components\/[^\/+]/)
  ) {
   activePage = getPage(
    location.hash,
    'component',
    topTray.activeTheme,
    location.hash.substring(13)
   )
  } else {
   switch (location.hash) {
    case '':
    case '#':
     activePage = getPage(
      location.hash,
      'home',
      topTray.activeTheme,
      ''
     )
     break
    case '#/about':
    case '#/journals':
     activePage = getPage(
      location.hash,
      location.hash.substring(2),
      topTray.activeTheme,
      ''
     )
     break
   }
  }
  if (activePage) {
   // routing occurred
   await activePage.onLoad?.(false)
   activePage.element.setAttribute(
    'data-starryui-reveal',
    'hidden'
   ) // todo can move to onLoad
   document.body.appendChild(activePage.element)
   await new Promise((r) =>
    setTimeout(r, NORMAL_DELAY_MS)
   )
   activePage.element.setAttribute(
    'data-starryui-reveal',
    'reveal'
   ) // todo can move to onLoad
   await activePage.onLoad?.(true)
  } else {
   console.warn(
    `Path ${location.hash} did not have an associated page`
   )
  }
 }

 return route
}
