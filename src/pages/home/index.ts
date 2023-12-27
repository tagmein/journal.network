import { frame } from '@starryui/frame'
import { column, row } from '@starryui/layout'
import {
 StarryUIPage,
 page,
} from '@starryui/page'
import {
 StarryUITheme,
 applyTheme,
 applyThemeMultiple,
 attachStyle,
 attachThemeFacet,
 attachThemeVariables,
} from '@starryui/theme'

export function home(
 theme: StarryUITheme
): StarryUIPage {
 const themedPage = applyTheme(theme, page)

 const arrowStyle = attachStyle(
  theme,
  '.arrow-next',
  {
   alignSelf: 'flex-end',
   fontSize: '48px',
   maxWidth: '24px',
   overflow: 'hidden',
   textAlign: 'right',
   textIndent: '-24px',
  }
 )

 function arrowNext() {
  const arrow = document.createElement('div')
  arrow.classList.add('arrow-next')
  arrow.innerHTML = '&rarr;'
  return arrow
 }

 return themedPage({
  title: 'Home',
  content(container, config) {
   const themeVariablesStyle:
    | HTMLStyleElement
    | undefined = attachThemeVariables(
    container,
    theme.variables
   )
   const [
    themedRow,
    themedColumn,
    themedFrame,
   ] = applyThemeMultiple(theme, [
    row,
    column,
    frame,
   ])
   const topArea = themedRow({
    style: {
     alignItems: 'center',
     flexGrow: '0',
     gap: 'var(--dimension4)',
     minHeight: '128px',
     justifyContent: 'space-evenly',
     padding:
      'var(--dimension3) var(--dimension4)',
    },
    themeFacets: ['document', 'opaque'],
   })
   topArea.setAttribute('data-responsive', '1')
   const header = document.createElement('h2')
   header.style.minWidth = '150px'
   header.textContent =
    'Share your journal with the world'
   const para0 = document.createElement('p')
   para0.textContent =
    'Journal Network allows anyone to create a journal and share it with others. People can subscribe and recieve updates when you publish a journal entry. Founded 2023.'
   const para1 = document.createElement('p')
   para1.innerHTML =
    'Find the source code on <a href="https://github.com/tagmein/journal.network" target="_blank">GitHub</a>.'
   topArea.appendChild(header)
   topArea.appendChild(para0)
   topArea.appendChild(para1)
   container.appendChild(topArea)
   const mainArea = themedRow({
    style: {
     gap: '10px',
     padding: '10px',
    },
    themeFacets: ['opaque'],
   })

   function headerText(text: string) {
    const h2 = document.createElement('h2')
    h2.textContent = text
    return h2
   }

   const entries = themedColumn({
    style: {
     alignItems: 'center',
     flexGrow: '0',
     gap: 'var(--dimension4)',
     justifyContent: 'space-evenly',
     padding:
      'var(--dimension4) var(--dimension3)',
    },
    themeFacets: ['document', 'opaque'],
   })

   for (const { description, href, name } of [
    {
     name: 'About',
     description: 'Learn about Journal Network',
     href: '/#/about',
    },
    {
     name: 'Directory',
     description: 'Browse popular journals',
     href: '/#/directory',
    },
    {
     name: 'Write',
     description: 'Start your own journal',
     href: '/#/start',
    },
   ]) {
    const frame = themedFrame({
     href,
     style: {
      padding:
       'var(--dimension3) var(--dimension4)',
     },
     tagName: 'a',
    })
    attachThemeFacet(frame, theme, 'link-frame')
    frame.appendChild(headerText(name))
    const descPara = document.createElement('p')
    descPara.textContent = description
    frame.appendChild(descPara)
    entries.appendChild(frame)
   }
   mainArea.appendChild(entries)
   container.appendChild(mainArea)

   config?.startUpTasks?.initial?.push?.(
    function () {
     if (arrowStyle) {
      document.head.appendChild(arrowStyle)
     }
     if (themeVariablesStyle) {
      document.head.appendChild(
       themeVariablesStyle
      )
     }
    }
   )

   config?.cleanUpTasks?.final?.push(
    function () {
     if (arrowStyle) {
      document.head.removeChild(arrowStyle)
     }
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
