export interface Modal {
 close(): void
 element: HTMLFormElement
}

export interface ModalOptions {
 content(modal: Modal): void
 onSubmit(): Promise<void>
}

function createOverlay(
 close: () => void
) {
 const overlay =
  document.createElement('div')
 overlay.style.backgroundColor =
  '#80808080'
 overlay.style.position = 'fixed'
 overlay.style.top = '0'
 overlay.style.left = '0'
 overlay.style.right = '0'
 overlay.style.bottom = '0'

 overlay.addEventListener(
  'click',
  close
 )

 return overlay
}

export function openModal({
 content,
 onSubmit,
}: ModalOptions): Modal {
 function close() {
  overlay.remove()
 }
 const overlay = createOverlay(close)

 const element =
  document.createElement('form')
 element.tabIndex = 0

 element.addEventListener(
  'click',
  (e) => e.stopPropagation()
 )

 Object.assign(element.style, {
  backgroundColor: 'var(--theme3)',
  border: '1px solid var(--theme4)',
  padding: 'var(--dimension3)',
  margin: '50vh auto',
  maxWidth: '240px',
  transform: 'translateY(-50%)',
 })

 element.addEventListener(
  'submit',
  onSubmit
 )

 const modal = {
  element,
  close,
 }
 content(modal)
 overlay.appendChild(element)
 document.body.appendChild(overlay)

 return modal
}
