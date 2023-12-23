import {
 StarryUITheme,
 attachStyle,
} from '@starryui/theme'
import { CivilPreferenceNames } from '../lib/CivilPreferenceNames'
import { KVDBDirectoryTools } from '../lib/kvdb'

export interface KVDBBrowserSidebarView {
 destroy(): void
 element: HTMLElement
 getVisible(): Promise<boolean>
 setVisible(visible: boolean): Promise<void>
}

export function kvdbBrowserSidebar(
 theme: StarryUITheme,
 preferences: KVDBDirectoryTools
): KVDBBrowserSidebarView {
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
  attachStyle(theme, '.pageEditor', {
   backgroundColor: 'var(--theme2)',
   flexGrow: '1',
   overflow: 'hidden',
  }),
  attachStyle(theme, '.projects-sidebar', {
   backgroundColor: 'var(--theme1)',
   borderRight: '1px solid var(--theme4)',
   marginLeft: '-240px',
   transition: 'margin-left 0.2s ease',
   width: '240px',
  }),
  attachStyle(
   theme,
   '.projects-sidebar.visible',
   {
    marginLeft: '0',
   }
  ),
 ]

 const element = document.createElement('div')
 element.classList.add('projects-sidebar')

 async function getVisible() {
  return (
   (
    await preferences.page.read(
     [],
     CivilPreferenceNames.ProjectSidebar.Visible
    )
   ).page?.content !== 'hide'
  )
 }

 async function setVisible(visible: boolean) {
  if (visible) {
   await preferences.page.delete(
    [],
    CivilPreferenceNames.ProjectSidebar.Visible
   )

   element.classList.add('visible')
  } else {
   await preferences.page.create([], {
    name:
     CivilPreferenceNames.ProjectSidebar
      .Visible,
    content: 'hide',
   })
   element.classList.remove('visible')
  }
 }

 async function start() {
  if (await getVisible()) {
   element.classList.add('visible')
  }
 }

 start().catch((e) => console.error(e))

 function destroy() {
  for (const sheet of stylesheets) {
   document.head.removeChild(sheet)
  }
 }

 return {
  destroy,
  element,
  getVisible,
  setVisible,
 }
}
