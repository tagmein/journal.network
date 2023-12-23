import { StarryUITheme } from '@starryui/theme'
import { KVDBDirectoryTools } from '../lib/kvdb'
import {
 ItemAction,
 list,
} from './list'

export interface ListItem {
 name: string
 namespace: string
 path: string[]
 type: 'page' | 'directory'
 listPageName?: string
}

export interface List {
 name: string
 items: ListItem[]
}

function createActionHandlers(
 loadDirectory: (
  path: string[],
  highlightItem?: {
   type: 'page' | 'directory'
   name: string
  },
  openHighlight?: 'top' | 'blank'
 ) => Promise<void>,
 removeItem: (
  itemPage: string
 ) => Promise<void>
): ItemAction[] {
 return [
  [
   '✕',
   async (item: ListItem) => {
    if (item.listPageName) {
     await removeItem(item.listPageName)
    }
   },
   'Remove item from list',
  ],
  [
   '＋',
   async (item: ListItem) => {
    console.log('Add to list', item)
   },
   '(coming soon) add item to another list',
  ],
  [
   '⎘',
   async (item: ListItem) => {
    await loadDirectory(
     item.path,
     {
      type: item.type,
      name: item.name,
     },
     'blank'
    )
   },
   'Locate item in Index',
  ],
 ]
}

export function editableList(
 theme: StarryUITheme,
 kvdbDir: KVDBDirectoryTools,
 listName: string,
 loadDirectory: (
  path: string[],
  highlightItem?: {
   type: 'page' | 'directory'
   name: string
  },
  openHighlight?: 'top' | 'blank'
 ) => Promise<void>
): {
 addItemToList(
  item: ListItem
 ): Promise<void>
 destroy(): void
 element: HTMLElement
 loadList(): Promise<void>
} {
 const element =
  document.createElement('div')

 const listComponent = list(theme)
 element.appendChild(
  listComponent.element
 )

 listComponent.setItemActions(
  createActionHandlers(
   loadDirectory,
   removeItem
  )
 )

 async function removeItem(
  itemPage: string
 ) {
  await kvdbDir.page.delete(
   [listName],
   itemPage
  )
  loadList()
 }

 function waitForLoad() {
  return new Promise<void>(
   (resolve) => {
    const loadInterval = setInterval(
     () => {
      if (
       element.dataset.loading !==
       'true'
      ) {
       clearInterval(loadInterval)
       resolve()
      }
     },
     50
    )
   }
  )
 }
 async function loadList() {
  element.dataset.loading = 'true'

  const pageList =
   await kvdbDir.page.list([listName])

  listComponent.setItems(
   (
    await Promise.all(
     pageList.pages
      .sort(function (a, b) {
       return (
        parseInt(a, 10) -
        parseInt(b, 10)
       )
      })
      .map(async (pageName) => {
       const pageResponse =
        await kvdbDir.page.read(
         [listName],
         pageName
        )
       if (!pageResponse.page) {
        return undefined
       }
       const page: ListItem =
        JSON.parse(
         pageResponse.page.content ??
          '{}'
        )
       page.listPageName = pageName
       return page
      })
    )
   ).filter(
    (x) => typeof x !== 'undefined'
   ) as ListItem[],
   async (item: ListItem) => {
    loadDirectory(
     item.path,
     item,
     'top'
    )
   }
  )

  element.dataset.loading = 'false'
 }

 async function addItemToList(
  item: ListItem
 ) {
  await waitForLoad()
  const pageList =
   await kvdbDir.page.list([listName])
  const maxPageNum =
   pageList.pages.length > 0
    ? Math.max(
       ...pageList.pages.map((page) =>
        !isNaN(parseInt(page, 10))
         ? parseInt(page, 10)
         : -1
       )
      )
    : -1
  if (isNaN(maxPageNum)) {
   throw new Error(
    `Unknown list page name, refusing add`
   )
  }
  const nextPageNum = (
   maxPageNum + 1
  ).toString()

  await kvdbDir.page.create(
   [listName],
   {
    name: nextPageNum,
    content: JSON.stringify(item),
   }
  )

  loadList()
 }

 loadList()

 function destroy() {
  listComponent.destroy()
  element.remove()
 }

 return {
  addItemToList,
  loadList,
  element,
  destroy,
 }
}
