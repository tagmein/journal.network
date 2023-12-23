import {
 StarryUITheme,
 attachStyle,
} from '@starryui/theme'

export interface Tab {
 name: string
 element: HTMLElement
 contents: () => TabContents
 cachedContents?: TabContents
}

export interface TabContents {
 destroy(): void
 element: HTMLElement
}

export interface TabSwitcherView {
 destroy(): void
 element: HTMLElement
 openTab(
  name: string,
  contents?: () => TabContents,
  closeable?: boolean,
  switchTo?: boolean
 ): void
 closeTab(name: string): void
}

export function tabSwitcher(
 theme: StarryUITheme,
 tabContentHostElement: HTMLElement
): TabSwitcherView {
 const element =
  document.createElement('div')
 element.classList.add(
  'tabSwitcher_tabBar'
 )
 const stylesheets = [
  attachStyle(
   theme,
   '.tabSwitcher_tabBar',
   [
    {
     '': {
      borderBottom:
       '1px solid var(--theme4)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',
      flexShrink: '0',
      height: '56px',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding:
       'var(--dimension3) var(--dimension3) 0',
     },
     '& > div': {
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'row',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      maxWidth: '180px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition:
       'background-color 0.2s ease, border-bottom 0.2s ease',
     },
     '& > div > label': {
      cursor: 'inherit',
      flexShrink: '1',
      flexGrow: '1',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      padding:
       'var(--dimension2) var(--dimension3) var(--dimension1)',
     },
     '& > div > button': {
      backgroundColor: 'transparent',
      border: 'none',
      borderLeft:
       '1px solid var (--theme4)',
      marginLeft: '-22px',
      borderRadius: '0',
      color: 'var(--theme8)',
      flexShrink: '0',
      flexGrow: '0',
      cursor: 'pointer',
      padding:
       'var(--dimension1) var(--dimension2)',
      transition:
       'background-color 0.2s ease, border-bottom 0.2s ease',
     },
     '& > div > button:hover': {
      backgroundColor: 'var(--theme6)',
     },
     '& > div:hover': {
      backgroundColor: 'var(--theme4)',
     },
     '& > div[data-active="true"]': {
      backgroundColor: 'var(--theme2)',
      borderBottom:
       'var(--dimension1) solid var(--theme8)',
      cursor: 'text',
     },
    },
   ]
  ),
 ]

 let tabs: Tab[] = []
 let activeTab: Tab | undefined =
  undefined
 // Add keyboard event listener to tab bar
 element.addEventListener(
  'keydown',
  (e) => {
   if (
    e.key === 'ArrowRight' ||
    e.key === 'ArrowLeft'
   ) {
    e.preventDefault() // Prevent scroll

    const currentIndex = tabs.findIndex(
     (t) => t.name === activeTab?.name
    )

    let nextIndex: number
    if (e.key === 'ArrowRight') {
     nextIndex = currentIndex + 1
     if (nextIndex >= tabs.length) {
      nextIndex = 0
     }
    } else {
     nextIndex = currentIndex - 1
     if (nextIndex < 0) {
      nextIndex = tabs.length - 1
     }
    }

    switchToTab(tabs[nextIndex].name)
   }
  }
 )

 function createTab(
  name: string,
  closeable = true
 ) {
  const tab =
   document.createElement('div')
  tab.setAttribute('title', name)
  tab.setAttribute('tabindex', '0')
  tab.addEventListener(
   'mouseenter',
   function () {
    tab.scrollIntoView({
     behavior: 'smooth',
    })
   }
  )
  const label =
   document.createElement('label')
  label.textContent = name
  tab.appendChild(label)
  if (closeable) {
   const closeBtn =
    document.createElement('button')
   closeBtn.textContent = '✕'

   closeBtn.addEventListener(
    'click',
    function (event) {
     event.stopPropagation()
     closeTab(name)
    }
   )

   tab.addEventListener(
    'keydown',
    function ({ key }) {
     if (key === 'Escape') {
      closeTab(name)
     }
    }
   )

   tab.appendChild(closeBtn)
  }

  tab.addEventListener('click', () => {
   switchToTab(name)
  })

  return tab
 }

 function switchToTab(name: string) {
  const tab = tabs.find(
   (t) => t.name === name
  )
  if (!tab) {
   return false
  }

  if (activeTab === tab) {
   return true
  }

  if (activeTab) {
   activeTab.element.dataset.active =
    'false'

   if (activeTab.cachedContents) {
    tabContentHostElement.removeChild(
     activeTab.cachedContents.element
    )
   }
  }
  activeTab = tab

  if (!tab.cachedContents) {
   tab.cachedContents = tab.contents()
  }
  tabContentHostElement.appendChild(
   tab.cachedContents.element
  )
  activeTab.element.dataset.active =
   'true'
  activeTab.element.focus()
  activeTab.element.scrollIntoView({
   behavior: 'smooth',
  })
  return true
 }

 function closeTab(name: string) {
  // Find index of tab
  const index = tabs.findIndex(
   (t) => t.name === name
  )

  if (index === -1) {
   return
  }

  element.children[index].remove()
  tabs[
   index
  ].cachedContents?.destroy?.()
  tabs.splice(index, 1)

  // If closing active tab
  if (activeTab?.name === name) {
   // Set active to previous
   let prevIndex = index - 1
   if (prevIndex < 0) {
    prevIndex = 0
   }

   if (tabs[prevIndex]) {
    switchToTab(tabs[prevIndex].name)
   } else {
    activeTab = undefined
   }
  }
 }

 function openTab(
  name: string,
  contents?: () => TabContents,
  closeable = true,
  switchTo = true
 ) {
  if (
   !tabs.find(
    (tab) => tab.name === name
   )
  ) {
   if (!contents) {
    throw new Error(
     `tab ${JSON.stringify(
      name
     )} not found`
    )
   }
   const tab = createTab(
    name,
    closeable
   )
   element.appendChild(tab)
   tabs.push({
    name,
    contents,
    element: tab,
   })
  }

  if (switchTo || !activeTab) {
   switchToTab(name)
  }
 }

 return {
  destroy() {
   for (const stylesheet of stylesheets) {
    document.head.removeChild(
     stylesheet
    )
   }
  },
  element,
  openTab,
  closeTab,
 }
}
