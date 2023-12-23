import { column } from '@starryui/layout'
import {
 StarryUIPage,
 page,
} from '@starryui/page'
import {
 StarryUITheme,
 applyTheme,
 attachThemeFacet,
 attachThemeVariables,
} from '@starryui/theme'
import { renderMarkdownFromPath } from '../../markdown'

export function about(
 theme: StarryUITheme
): StarryUIPage {
 const themedPage = applyTheme(
  theme,
  page
 )
 return themedPage({
  title: 'About',
  content(container, config) {
   const themedColumn = applyTheme(
    theme,
    column
   )
   const mainArea = themedColumn({
    style: {
     padding:
      'var(--dimension3) var(--dimension4)',
    },
    themeFacets: ['document', 'opaque'],
   })
   container.appendChild(mainArea)
   const themeVariablesStyle:
    | HTMLStyleElement
    | undefined = attachThemeVariables(
    mainArea,
    theme.variables
   )

   function renderExample(
    className: string,
    build: () => HTMLElement
   ) {
    const example =
     mainArea.getElementsByClassName(
      className
     )[0] as HTMLElement
    if (!example) {
     console.warn(
      '.${className} element not found'
     )
     return
    }
    attachThemeFacet(
     example,
     theme,
     'row'
    )
    example.setAttribute(
     'data-responsive',
     '1'
    )
    const code =
     example.previousElementSibling as HTMLElement
    if (!code) {
     console.warn(
      '.${className} previous code element not found'
     )
     return
    }
    const result =
     document.createElement('div')
    result.style.width = '50%'
    attachThemeFacet(
     result,
     theme,
     'column'
    )

    const source =
     document.createElement('div')
    attachThemeFacet(
     source,
     theme,
     'column'
    )

    const sourceTitle =
     document.createElement('h6')
    const resultTitle =
     document.createElement('h6')
    sourceTitle.textContent =
     'TypeScript Source'
    resultTitle.textContent = 'Result'
    result.appendChild(resultTitle)
    source.appendChild(sourceTitle)

    const resultContainer =
     document.createElement('div')
    resultContainer.style.padding =
     '10px'
    attachThemeFacet(
     resultContainer,
     theme,
     'column'
    )
    attachThemeFacet(
     resultContainer,
     theme,
     'opaque-alt'
    )
    result.appendChild(resultContainer)

    source.appendChild(code)
    example.appendChild(source)
    example.appendChild(result)

    resultContainer.appendChild(build())
   }

   mainArea.textContent = 'loading...' // todo loading component

   async function load() {
    mainArea.innerHTML =
     await renderMarkdownFromPath(
      '/pages/about/content.md'
     )
   }

   load().catch((e) => console.warn(e))

   config?.startUpTasks?.initial?.push?.(
    function () {
     if (themeVariablesStyle) {
      document.head.appendChild(
       themeVariablesStyle
      )
     }
    }
   )

   config?.cleanUpTasks?.final?.push(
    function () {
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
