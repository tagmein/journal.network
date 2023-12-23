import {
 StarryUITheme,
 attachStyle,
} from '@starryui/theme'

export interface Breadcrumb {
 label: string
 path: string[]
 element: HTMLElement
}

export function breadcrumbNavigator(
 theme: StarryUITheme,
 namespace: string,
 loadDirectory: (path: string[]) => void
) {
 const stylesheets: HTMLStyleElement[] =
  [
   attachStyle(
    theme,
    '.breadcrumbNavigator_container',
    {
     borderBottom:
      '1px solid var(--theme4)',
     boxSizing: 'border-box',
     display: 'flex',
     alignItems: 'flex-start',
     fontSize: '14px',
     height: '38px',
     overflowX: 'auto',
     overflowY: 'hidden',
     padding: 'var(--dimension2)',
     whiteSpace: 'pre',
    }
   ),
   attachStyle(
    theme,
    '.breadcrumbNavigator_container > span',
    {
     cursor: 'pointer',
     display: 'block',
     padding: '0 var(--dimension1)',
    }
   ),
   attachStyle(
    theme,
    '.breadcrumbNavigator_container > span + span:before',
    {
     content: '"\\279C"',
     display: 'inline-block',
     margin: '0 var(--dimension1)',
     opacity: '0.75',
     overflow: 'hidden',
     textIndent: '-4px',
     verticalAlign: 'bottom',
     width: '12px',
    }
   ),
  ]

 // Breadcrumbs
 const element =
  document.createElement('div')
 element.classList.add(
  'breadcrumbNavigator_container'
 )

 function createBreadcrumb(
  label: string,
  onClick?: () => void
 ) {
  const bc =
   document.createElement('span')
  bc.textContent = label
  if (onClick) {
   bc.addEventListener('click', onClick)
  }

  return bc
 }

 function renderBreadcrumbs(
  path: string[]
 ): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [
   {
    label: 'Root',
    path: [],
    element:
     path.length === 0
      ? createBreadcrumb(namespace)
      : createBreadcrumb(
         namespace,
         function () {
          loadDirectory([])
         }
        ),
   },
  ]

  crumbs[0].element.textContent =
   namespace

  path.forEach((dir) => {
   const crumb = {
    label: dir,
    path: [
     ...(crumbs[crumbs.length - 1]
      .path ?? []),
     dir,
    ],
    element: createBreadcrumb(
     dir,
     () => {
      loadDirectory(crumb.path)
     }
    ),
   }
   crumbs.push(crumb)
  })

  return crumbs
 }

 function setPath(path: string[]) {
  element.textContent = ''
  const crumbs = renderBreadcrumbs(path)
  crumbs.forEach((crumb) => {
   element.appendChild(crumb.element)
  })
 }

 function destroy() {
  element.remove()
  for (const sheet of stylesheets) {
   document.head.removeChild(sheet)
  }
 }

 return {
  destroy,
  element,
  setPath,
 }
}
