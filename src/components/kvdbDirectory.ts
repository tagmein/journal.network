import { button } from '@starryui/button'
import {
 StarryUITheme,
 applyThemeMultiple,
} from '@starryui/theme'
import { withTextContent } from '@starryui/traits'
import { KVDBDirectoryTools } from '../lib/kvdb'
import { breadcrumbNavigator } from './breadcrumbNavigator'
import { createItemModal } from './createItemModal'
import { kvdbPage } from './kvdbPage'
import {
 ItemAction,
 ListView,
 list,
} from './list'
import {
 TabContents,
 TabSwitcherView,
} from './tabSwitcher'

export interface KVDBDirectoryView {
 destroy(): void
 directoriesList: ListView
 loadDirectory(
  path?: string[],
  highlightItem?: {
   type: 'page' | 'directory'
   name: string
  },
  openHighlight?: 'top' | 'blank'
 ): Promise<void>
 pagesList: ListView
 view(): TabContents
}

export function kvdbDirectory(
 theme: StarryUITheme,
 tabs: TabSwitcherView,
 kvdbInstance: KVDBDirectoryTools,
 directoryActions: ItemAction[],
 pageActions: ItemAction[]
): KVDBDirectoryView {
 const [themedButton] = applyThemeMultiple(
  theme,
  [button]
 )

 // Menu bar
 const menu = document.createElement('div')
 Object.assign(menu.style, {
  borderBottom: '1px solid var(--theme4)',
  display: 'flex',
  alignItems: 'flex-start',
  height: '38px',
  overflowX: 'auto',
  overflowY: 'hidden',
 })

 // Breadcrumbs
 const breadcrumbs = breadcrumbNavigator(
  theme,
  kvdbInstance.namespace,
  loadDirectory
 )

 // Directories
 const directoriesList = list(theme)
 const directoriesHeader =
  document.createElement('h3')
 directoriesHeader.textContent = 'Directories'
 Object.assign(directoriesHeader.style, {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '0 var(--dimension3)',
  marginBottom: '0',
 })
 // Pages
 const pagesList = list(theme)
 const pagesHeader =
  document.createElement('h3')
 pagesHeader.textContent = 'Pages'
 Object.assign(pagesHeader.style, {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '0 var(--dimension3)',
  marginBottom: '0',
 })

 const createDirButton = themedButton.add(
  withTextContent('Create Directory')
 )({})
 directoriesHeader.append(createDirButton)

 const createPageButton = themedButton.add(
  withTextContent('Create Page')
 )()
 createPageButton.textContent = 'Create Page'
 pagesHeader.append(createPageButton)

 createDirButton.addEventListener(
  'click',
  function () {
   createItemModal(
    theme,
    'Create Directory',
    async function (name) {
     await kvdbInstance.directory.create(
      lastKnownPath,
      name
     )
     loadDirectory([...lastKnownPath, name])
    }
   )
  }
 )

 createPageButton.addEventListener(
  'click',
  function () {
   createItemModal(
    theme,
    'Create Page',
    async function (name) {
     await kvdbInstance.page.create(
      lastKnownPath,
      {
       name,
       content: '',
       url: '',
      }
     )
     loadDirectory(lastKnownPath)
    }
   )
  }
 )

 // Load initial data
 let lastKnownPath: string[] = []

 // Helpers
 async function loadDirectory(
  path: string[] = [],
  highlightItem?: {
   type: 'page' | 'directory'
   name: string
  },
  openHighlight?: 'top' | 'blank'
 ) {
  if (path && highlightItem) {
   switch (openHighlight) {
    case 'top':
     switch (highlightItem.type) {
      case 'directory':
       return loadDirectory([
        ...path,
        highlightItem.name,
       ])
      case 'page':
       tabs.openTab(
        `${kvdbInstance.namespace}#${path.join(
         '/'
        )}#${highlightItem.name}`,
        () =>
         kvdbPage(theme, kvdbInstance, {
          path,
          namespace: kvdbInstance.namespace,
          ...highlightItem,
         })
       )
       return
     }
   }
  }
  if (!path) {
   path = lastKnownPath
  }
  lastKnownPath = path
  // Switch to Index tab
  tabs.openTab('Index')
  // Fetch directories and pages
  await Promise.all(
   [
    async function () {
     const dirList =
      await kvdbInstance.directory.list(path!)
     directoriesList.setItemActions(
      directoryActions
     )
     directoriesList.setItems(
      dirList.dirs.map((name) => ({
       name,
       namespace: kvdbInstance.namespace,
       path,
       type: 'directory',
      })),
      async function (dir) {
       loadDirectory([...path!, dir.name])
      }
     )
    },
    async function () {
     const pageList =
      await kvdbInstance.page.list(path!)

     pagesList.setItemActions(pageActions)
     pagesList.setItems(
      pageList.pages.map((name) => ({
       name,
       namespace: kvdbInstance.namespace,
       path,
       type: 'page',
      })),
      async function (page) {
       tabs.openTab(
        `${page.namespace}#${page.path.join(
         '/'
        )}#${page.name}`,
        () =>
         kvdbPage(theme, kvdbInstance, page)
       )
      }
     )
    },
   ].map((x) => x())
  )
  breadcrumbs.setPath(path)
 }

 let viewContent: HTMLElement

 function view() {
  if (!viewContent) {
   viewContent = document.createElement('div')
   viewContent.append(
    breadcrumbs.element,
    menu,
    directoriesHeader,
    directoriesList.element,
    pagesHeader,
    pagesList.element
   )
  }
  return {
   destroy() {
    viewContent.remove()
   },
   element: viewContent,
  }
 }

 function destroy() {
  breadcrumbs.destroy()
  directoriesList.destroy()
  pagesList.destroy()
 }

 return {
  destroy,
  directoriesList,
  loadDirectory,
  pagesList,
  view,
 }
}
