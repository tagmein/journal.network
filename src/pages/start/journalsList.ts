import { button } from '@starryui/button'
import { frame } from '@starryui/frame'
import {
 StarryUITheme,
 applyThemeMultiple,
} from '@starryui/theme'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import { createItemModal } from '../../components/createItemModal'
import { journals } from '../../lib/journals'

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
   const journalFrame = themedFrame({
    tagName: 'a',
    href: `/#/journal/${encodeURIComponent(
     journal.user
    )}/${journal.name}`,
   })
   journalFrame.style.display = 'block'
   journalFrame.style.padding =
    'var(--dimension3) var(--dimension4)'
   journalFrame.style.marginBottom =
    'var(--dimension4)'
   const journalTitle =
    document.createElement('h2')
   journalTitle.textContent = journal.name
   const journalDate =
    document.createElement('p')
   journalDate.textContent = `Created ${new Date(
    journal.createdAt
   ).toLocaleString()}`
   const journalUser =
    document.createElement('p')
   journalUser.style.float = 'right'
   journalUser.textContent = `Author: ${journal.user}`
   journalFrame.append(
    journalUser,
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
