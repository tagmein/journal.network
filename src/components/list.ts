import { button } from '@starryui/button'
import {
 StarryUITheme,
 applyTheme,
 attachStyle,
} from '@starryui/theme'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import { ListItem } from './editableList'

export type ItemAction = [
 string,
 (item: ListItem) => Promise<void>,
 string
]

export interface ListView {
 destroy(): void
 element: HTMLElement
 setItemActions(itemActions: ItemAction[]): void
 setItems(
  items: ListItem[],
  onClick: (item: ListItem) => Promise<void>
 ): void
}

export function list(
 theme: StarryUITheme
): ListView {
 const themedButton = applyTheme(theme, button)
 const stylesheets: HTMLStyleElement[] = [
  attachStyle(theme, '.list_container', [
   {
    '': {
     overflowX: 'hidden',
     overflowY: 'auto',
     padding: 'var(--dimension3)',
    },
    '& > div': {
     backgroundColor: 'var(--theme4)',
     border: '1px solid var(--theme4)',
     borderRadius: 'var(--dimension3)',
     cursor: 'pointer',
     display: 'flex',
     flexDirection: 'row',
     lineHeight: '28px',
     margin: 'var(--dimension2) 0',
     minHeight: '30px',
     padding:
      'var(--dimension1) calc(var(--dimension2) + var(--dimension1))',
     whiteSpace: 'pre',
    },
    '& > div:hover': {
     backgroundColor: 'var(--theme5)',
    },
    '& > div:active': {
     backgroundColor: 'var(--theme3)',
    },
    '& > div > label': {
     cursor: 'pointer',
     flexGrow: '1',
     flexShrink: '1',
     overflow: 'hidden',
     textOverflow: 'ellipsis',
    },
    '& > div > button': {
     borderRadius: '100%',
     boxSizing: 'border-box',
     display: 'inline-block',
     flexGrow: '0',
     flexShrink: '0',
     fontSize: '16px',
     height: '24px',
     lineHeight: '20px',
     margin: '3px 0 0 var(--dimension1)',
     padding: '0',
     textIndent: '0',
     width: '24px',
     minWidth: '24px',
    },
   },
  ]),
 ]
 const element = document.createElement('div')
 element.classList.add('list_container')

 let itemActions: ItemAction[] = []
 let currentItem: ListItem
 let itemActionButtons: HTMLElement[] = []

 function setItemActions(
  newItemActions: ItemAction[]
 ) {
  itemActions = newItemActions
  itemActionButtons.forEach(function (x) {
   x.remove()
  })
  itemActionButtons = itemActions.map(
   function ([label, action, title]) {
    const actionButton = themedButton.add(
     withTextContent(label),
     withClick(function (event) {
      event.stopPropagation()
      if (typeof currentItem === 'undefined') {
       throw new Error('hmm')
      }
      action(currentItem)
     })
    )()
    actionButton.setAttribute('title', title)
    return actionButton
   }
  )
 }

 function showButtons(
  itemElement: HTMLElement,
  item: ListItem
 ) {
  clearTimeout(hideTimeout)
  currentItem = item
  for (const element of itemActionButtons) {
   if (element.parentElement !== itemElement) {
    itemElement.appendChild(element)
   }
  }
 }

 let hideTimeout: NodeJS.Timeout
 function hideButtons() {
  clearTimeout(hideTimeout)
  hideTimeout = setTimeout(function () {
   for (const element of itemActionButtons) {
    element.remove()
   }
  }, 1e4)
 }

 function setItems(
  items: ListItem[],
  onClick: (item: ListItem) => Promise<void>
 ) {
  if (items.length === 0) {
   element.textContent = 'No items'
   return element
  }

  element.textContent = ''

  items.forEach(function (item) {
   const div = document.createElement('div')
   div.setAttribute('tabindex', '0')
   const label = document.createElement('label')
   label.textContent = item.name
   div.appendChild(label)
   div.addEventListener('click', function () {
    onClick(item)
   })
   div.addEventListener(
    'keydown',
    function ({ key }) {
     if (key === 'Enter') {
      onClick(item)
     }
    }
   )
   div.addEventListener(
    'mouseenter',
    function () {
     showButtons(div, item)
    }
   )
   element.appendChild(div)
  })
 }
 element.addEventListener(
  'mouseleave',
  hideButtons
 )

 function destroy() {
  for (const sheet of stylesheets) {
   document.head.removeChild(sheet)
  }
 }

 return {
  destroy,
  element,
  setItemActions,
  setItems,
 }
}
