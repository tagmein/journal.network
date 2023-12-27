import { frame } from '@starryui/frame'
import {
 StarryUITheme,
 applyTheme,
 applyThemeMultiple,
} from '@starryui/theme'
import { journals } from '../../lib/journals'
import { button } from '@starryui/button'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import { createItemModal } from '../../components/createItemModal'

export interface JournalsListControl {
 container: HTMLDivElement
 destroy(): void
}

export function journalsList(
 theme: StarryUITheme
): JournalsListControl {
 const container = document.createElement('div')
 const [themedButton, themedFrame] =
  applyThemeMultiple(theme, [button, frame])

 async function load() {
  container.textContent = 'Loading journal list'
  const myJournals = await journals.list()
  container.textContent = ''
  if (myJournals.length === 0) {
   const emptyMessage =
    document.createElement('h3')
   emptyMessage.textContent =
    'You have no journals'
   container.appendChild(emptyMessage)
  }
  myJournals.map((journal) => {
   const journalFrame = themedFrame()
   journalFrame.style.padding =
    '0 var(--dimension3)'
   journalFrame.style.marginBottom =
    'var(--dimension3)'
   const journalTitle =
    document.createElement('h2')
   journalTitle.textContent = journal.name
   const journalDate =
    document.createElement('p')
   journalDate.textContent = `Created ${new Date(
    journal.createdAt
   ).toLocaleString()}`
   journalFrame.append(
    journalTitle,
    journalDate
   )
   container.appendChild(journalFrame)
  })
  const newJournalButton = themedButton.add(
   withTextContent('New journal'),
   withClick(() => {
    createItemModal(
     theme,
     'New journal',
     async (name) => {
      await journals.create(name)
      await load()
     }
    )
   })
  )()
  container.appendChild(newJournalButton)
 }

 load().catch(
  (e) => (container.textContent = 'error')
 )

 function destroy() {}
 return { container, destroy }
}
