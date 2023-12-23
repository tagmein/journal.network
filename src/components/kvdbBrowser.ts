import { button } from '@starryui/button'
import {
 StarryUITheme,
 applyThemeMultiple,
 attachStyle,
} from '@starryui/theme'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import { tray } from '@starryui/tray'
import { User } from '../lib/auth'
import { kvdb } from '../lib/kvdb'
import { editableList } from './editableList'
import { kvdbBrowserSidebar } from './kvdbBrowserSidebar'
import { kvdbDirectory } from './kvdbDirectory'
import { ItemAction } from './list'
import { tabSwitcher } from './tabSwitcher'

export function kvdbBrowser(
 theme: StarryUITheme,
 user: User,
 namespace = ''
) {
 const stylesheets: HTMLStyleElement[] = [
  attachStyle(theme, '.kvdbBrowser_container', {
   display: 'flex',
   flexDirection: 'row',
   flexGrow: '1',
  }),
  attachStyle(theme, '.primary-action', [
   {
    '': {
     backgroundColor: '#306060',
    },
    '&:hover': {
     backgroundColor: '#50a0a0',
    },
   },
  ]),
 ]
 const kvdbInstance = kvdb(namespace)
 const element = document.createElement('div')
 element.classList.add('kvdbBrowser_container')

 const [themedButton, themedTray] =
  applyThemeMultiple(theme, [button, tray])

 // Menu bar
 const menu = themedTray({
  style: {
   backgroundColor: 'var(--theme2)',
   color: 'var(--theme8)',
   lineHeight: '20px',
  },
 })

 const toggleSidebarButton = themedButton.add(
  withClick(async function () {
   await sidebar.setVisible(
    !(await sidebar.getVisible())
   )
  }),
  withTextContent('𝍢')
 )({
  style: {
   backgroundColor: 'transparent',
   borderBottom: 'none',
   borderRight: '1px solid var(--theme4)',
   color: 'var(--theme8)',
   lineHeight: '22px',
   height: '100%',
   padding:
    'var(--dimension2) var(--dimension3)',
   boxSizing: 'border-box',
   maxHeight: 'initial',
  },
 })
 toggleSidebarButton.setAttribute(
  'title',
  'Toggle sidebar'
 )
 menu.appendChild(toggleSidebarButton)

 const contentContainer =
  document.createElement('div')
 Object.assign(contentContainer.style, {
  backgroundColor: 'var(--theme1)',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: '1',
  overflow: 'hidden',
  position: 'relative',
 })

 const contentFill =
  document.createElement('div')
 Object.assign(contentFill.style, {
  flexGrow: '1',
  overflow: 'hidden',
  position: 'relative',
 })

 const contentScroll =
  document.createElement('div')
 Object.assign(contentScroll.style, {
  overflowX: 'hidden',
  overflowY: 'auto',
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
 })

 const tabs = tabSwitcher(theme, contentScroll)

 const kvdbInstanceLists =
  kvdbInstance.enterNamespace('.lists')
 const lovedList = editableList(
  theme,
  kvdbInstanceLists,
  'Loved',
  (...args) =>
   directoryView.loadDirectory(...args)
 )

 const loveItemAction: ItemAction = [
  '❤',
  lovedList.addItemToList,
  'Add to Loved',
 ]

 const directoryView = kvdbDirectory(
  theme,
  tabs,
  kvdbInstance,
  [loveItemAction],
  [loveItemAction]
 )

 const sidebar = kvdbBrowserSidebar(
  theme,
  kvdbInstance.enterNamespace(
   '.civil-preferences'
  )
 )
 sidebar.element.appendChild(lovedList.element)

 contentFill.appendChild(contentScroll)

 contentContainer.append(
  menu,
  tabs.element,
  contentFill
 )

 element.append(
  sidebar.element,
  contentContainer
 )

 tabs.openTab(
  'Index',
  directoryView.view,
  false,
  true
 )

 directoryView.loadDirectory()

 function destroy() {
  element.remove()
  directoryView.destroy()
  sidebar.destroy()
  for (const sheet of stylesheets) {
   document.head.removeChild(sheet)
  }
 }
 return { destroy, element }
}
