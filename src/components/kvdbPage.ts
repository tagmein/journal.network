import {
 StarryUITheme,
 attachStyle,
} from '@starryui/theme'
import { civil_program } from '../lib/civil'
import { KVDBDirectoryTools } from '../lib/kvdb'
import { ListItem } from './editableList'
import { TabContents } from './tabSwitcher'

export interface KVDBPageView
 extends TabContents {}

export function kvdbPage(
 theme: StarryUITheme,
 kvdbInstance: KVDBDirectoryTools,
 page: ListItem
): KVDBPageView {
 const stylesheets = [
  attachStyle(theme, '.kvdbPage_container', [
   {
    '': {
     backgroundColor: 'var(--theme2)',
     display: 'flex',
     flexDirection: 'column',
     flexGrow: '1',
     height: '100%',
     overflow: 'hidden',
    },
    '& > textarea': {
     backgroundColor: 'var(--theme3)',
     border: 'none',
     borderBottom: '1px solid var(--theme4)',
     boxSizing: 'border-box',
     flexGrow: '1',
     flexShrink: '0',
     height: '50%',
     maxHeight: '240px',
     padding: 'var(--dimension2)',
     resize: 'none',
    },
    '& > article': {
     backgroundColor: 'var(--theme0)',
     flexGrow: '1',
    },
   },
  ]),
 ]

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

 const element = document.createElement('div')
 element.classList.add('kvdbPage_container')
 const source_code =
  document.createElement('textarea')
 const preview_area =
  document.createElement('article')
 element.append(menu, source_code, preview_area)
 async function load() {
  const fullPage = await kvdbInstance.page.read(
   page.path,
   page.name
  )
  source_code.value =
   fullPage.page.content ?? ''
  await preview()
 }
 load().catch((e) => console.error(e))
 async function preview() {
  const code = `
   args hello world
   get console log , call
  `
  const runtime = civil_program()
  runtime.args('hello', 'world')
  runtime.get('console', 'log')
  runtime.call()
  console.log(
   'final types',
   runtime.program.verify()
  )
  runtime.program.run(globalThis)
 }
 source_code.addEventListener('keyup', preview)
 function destroy() {
  for (const sheet of stylesheets) {
   document.head.removeChild(sheet)
  }
 }
 return { destroy, element }
}
