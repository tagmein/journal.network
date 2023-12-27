import { StarryUIPage } from '@starryui/page'
import { StarryUITheme } from '@starryui/theme'
import { NORMAL_DELAY_MS } from '@starryui/traits/constants.js'
import { MainTrayControl } from './main-tray'
import { about } from './pages/about'
import { home } from './pages/home'
import { start } from './pages/start'
import { journal } from './pages/journal'

export interface RouterControl {
 destroy(): Promise<void>
 route(): Promise<void>
}

export function router(
 topTray: MainTrayControl
): RouterControl {
 let activePage: StarryUIPage | undefined

 const pageCache = new Map<
  string,
  StarryUIPage
 >()

 async function destroy() {
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
 }

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
   case 'start':
    return topTray.withBreadcrumb(
     path,
     start(theme)
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
  await destroy()

  switch (location.hash) {
   case '':
   case '#':
    activePage = getPage(
     location.hash,
     'home',
     topTray.theme,
     ''
    )
    break
   case '#/about':
   case '#/directory':
   case '#/start':
    activePage = getPage(
     location.hash,
     location.hash.substring(2),
     topTray.theme,
     ''
    )
    break
  }

  if (location.hash.startsWith('#/journal/')) {
   const [_0, _1, userName, journalName] =
    location.hash
     .split('/')
     .map(decodeURIComponent)
   console.log({ userName, journalName })
   activePage = topTray.withBreadcrumb(
    location.hash,
    journal(
     topTray.theme,
     userName,
     journalName
    ),
    [{ title: 'Start', url: '/#/start' }]
   )
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

 return { destroy, route }
}
