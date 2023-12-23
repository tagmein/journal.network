import { button } from '@starryui/button'
import {
 StarryUITheme,
 applyThemeMultiple,
} from '@starryui/theme'
import { withTextContent } from '@starryui/traits'
import {
 Modal,
 openModal,
} from './openModal'

// Create Modal
export function createItemModal(
 theme: StarryUITheme,
 title: string,
 onSubmit: (
  name: string
 ) => Promise<void>
) {
 const [themedButton] =
  applyThemeMultiple(theme, [button])

 const nameInput = createNameInput()

 function createContent(modal: Modal) {
  const buttons = createButtons()
  const header = createHeader(title)
  modal.element.append(
   header,
   nameInput,
   buttons
  )
 }

 function createNameInput() {
  const nameInput =
   document.createElement('input')

  nameInput.setAttribute(
   'placeholder',
   'Enter name'
  )
  nameInput.setAttribute(
   'required',
   'required'
  )

  nameInput.style.backgroundColor =
   'var(--theme5)'
  nameInput.style.border =
   '1px solid var(--theme8)'
  nameInput.style.marginBottom =
   'var(--dimension3)'
  nameInput.style.padding =
   'var(--dimension1) var(--dimension2)'

  return nameInput
 }

 function createButtons() {
  // Existing button logic
  const buttons =
   document.createElement('div')
  buttons.style.display = 'flex'
  buttons.style.gap =
   'var(--dimension2)'

  const cancel = themedButton.add(
   withTextContent('Cancel')
  )()
  cancel.setAttribute('type', 'reset')
  cancel.addEventListener(
   'click',
   function () {
    createModal.close()
   }
  )

  const create = themedButton.add(
   withTextContent('Create')
  )()
  create.classList.add('primary-action')
  create.setAttribute('type', 'submit')

  buttons.append(cancel, create)
  return buttons
 }

 function createHeader(title: string) {
  const header =
   document.createElement('h3')
  header.textContent = title
  header.style.marginTop = '0'
  header.style.marginBottom =
   'var(--dimension3)'

  return header
 }

 const createModal = openModal({
  content: createContent,
  async onSubmit() {
   onSubmit(nameInput.value)
   createModal.close()
  },
 })

 return createModal
}
