import {
 StarryUITheme,
 applyThemeMultiple,
} from '@starryui/theme'

import { button } from '@starryui/button'
import { row } from '@starryui/layout'
import {
 withClick,
 withTextContent,
} from '@starryui/traits'
import {
 tray,
 traySpacer,
} from '@starryui/tray'
import {
 User,
 clearAuth,
 createAuth,
 getAuth,
} from '../lib/auth'

interface AuthElement {
 element: HTMLElement
 destroy(): void
}

function createAuthForm(
 theme: StarryUITheme,
 onUpdate: () => void
): AuthElement {
 let action: 'sign-in' | 'create-account' =
  'sign-in'

 const [themedButton, themedRow] =
  applyThemeMultiple(theme, [button, row])

 const form = document.createElement('form')

 async function submitAuthForm() {
  errorMessage.textContent = ''
  form.focus()

  for (const child of [
   form,
   ...form.children,
  ]) {
   child?.setAttribute?.('disabled', 'disabled')
  }

  const username = usernameInput.value
  const password = passwordInput.value
  const createAccount =
   action === 'create-account'

  try {
   const response = await createAuth(
    username,
    password,
    createAccount
   )

   if ('error' in response) {
    errorMessage.textContent = response.error
    return
   }

   onUpdate()
  } catch (error) {
   errorMessage.textContent = error.message
  } finally {
   for (const child of [
    form,
    ...form.children,
   ]) {
    child?.removeAttribute?.('disabled')
   }
  }
 }

 form.setAttribute('tabindex', '0')
 form.addEventListener(
  'keydown',
  async ({ key }) => {
   if (key === 'Enter') {
    await submitAuthForm()
   }
  }
 )
 form.addEventListener(
  'submit',
  async function (event) {
   event.preventDefault()
   await submitAuthForm()
  }
 )

 Object.assign(form.style, {
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--dimension3)',
  margin: 'var(--dimension3) auto',
  maxWidth: '480px',
  padding: 'var(--dimension4)',
 })

 const formTitle = document.createElement('h3')
 formTitle.textContent = 'Sign in to continue'

 function inputStyle(elem: HTMLElement) {
  Object.assign(elem.style, {
   backgroundColor: 'var(--theme1)',
   border: '1px solid var(--theme4)',
   padding:
    'var(--dimension1) var(--dimension2)',
  })
 }

 const usernameInput =
  document.createElement('input')
 usernameInput.type = 'text'
 usernameInput.name = 'username'
 usernameInput.setAttribute(
  'placeholder',
  'username'
 )
 inputStyle(usernameInput)
 usernameInput.setAttribute(
  'enterkeyhint',
  'Next'
 )

 const passwordInput =
  document.createElement('input')
 passwordInput.type = 'password'
 passwordInput.name = 'password'
 passwordInput.setAttribute(
  'placeholder',
  'password'
 )
 inputStyle(passwordInput)
 passwordInput.setAttribute(
  'enterkeyhint',
  'Sign in'
 )

 const buttonRow = themedRow({
  style: {
   gap: 'var(--dimension2)',
  },
 })

 const signInButton = themedButton.add(
  withClick(function () {
   action = 'sign-in'
  }),
  withTextContent('Sign in')
 )()

 const createAccountButton = themedButton.add(
  withClick(function () {
   action = 'create-account'
  }),
  withTextContent('Create account')
 )()

 buttonRow.append(
  signInButton,
  createAccountButton
 )

 const errorMessage =
  document.createElement('p')

 Object.assign(errorMessage.style, {
  color: '#f08080',
  margin: '0',
 })

 form.append(
  formTitle,
  usernameInput,
  passwordInput,
  buttonRow,
  errorMessage
 )

 return {
  element: form,
  destroy() {
   form.remove()
  },
 }
}

export function authGuard(
 container: HTMLElement,
 theme: StarryUITheme,
 onAuthenticated: (user: User) => AuthElement
) {
 let currentElement: AuthElement

 interface AccountTray {
  container: HTMLElement
  destroy(): void
  setExpiresAt(expires_at: number): void
  setMessage(message: string): void
 }

 function createAccountTray(): AccountTray {
  const [themedButton, themedTray] =
   applyThemeMultiple(theme, [button, tray])

  const accountTray = themedTray({
   style: {
    backgroundColor: 'var(--theme2)',
    color: 'var(--theme8)',
    lineHeight: '20px',
   },
  })

  const message = document.createElement('span')

  Object.assign(message.style, {
   fontSize: '14px',
   padding:
    'var(--dimension2) var(--dimension3)',
  })

  const countdown =
   document.createElement('span')

  countdown.setAttribute(
   'title',
   'Shows the remaining session time'
  )

  Object.assign(countdown.style, {
   fontSize: '14px',
   padding:
    'var(--dimension2) var(--dimension3)',
  })

  let countdownTimeout: NodeJS.Timeout

  const TIME_ONE_SECOND = 1e3
  const TIME_ONE_MINUTE = 6e4
  const TIME_ONE_HOUR = 36e5
  const TIME_ONE_DAY = 864e5

  function setExpiresAt(expires_at: number) {
   clearTimeout(countdownTimeout)
   const timeRemaining = expires_at - Date.now()
   function tick(
    timeText: string,
    delay: number
   ) {
    countdown.textContent = timeText
    countdownTimeout = setTimeout(function () {
     setExpiresAt(expires_at)
    }, delay)
   }
   if (timeRemaining > TIME_ONE_DAY) {
    tick(
     `${Math.floor(
      timeRemaining / TIME_ONE_DAY
     )}d`,
     TIME_ONE_DAY
    )
   } else if (timeRemaining > TIME_ONE_HOUR) {
    tick(
     `${Math.floor(
      timeRemaining / TIME_ONE_HOUR
     )}h`,
     TIME_ONE_HOUR
    )
   } else if (timeRemaining > TIME_ONE_MINUTE) {
    tick(
     `${Math.floor(
      timeRemaining / TIME_ONE_MINUTE
     )}m`,
     TIME_ONE_MINUTE
    )
   } else if (timeRemaining > 0) {
    tick(
     `${Math.floor(
      timeRemaining / TIME_ONE_SECOND
     )}s`,
     TIME_ONE_SECOND
    )
   } else {
    logoutNow()
   }
  }

  function setMessage(text: string) {
   message.textContent = text
  }

  async function logoutNow() {
   await clearAuth()
   render()
  }

  const logoutButton = themedButton.add(
   withClick(logoutNow),
   withTextContent('Logout')
  )({
   style: {
    backgroundColor: 'transparent',
    borderBottom: 'none',
    borderLeft: '1px solid var(--theme4)',
    color: 'var(--theme8)',
    lineHeight: '22px',
    height: '100%',
    padding:
     'var(--dimension2) var(--dimension3)',
    boxSizing: 'border-box',
    maxHeight: 'initial',
   },
  })

  logoutButton.setAttribute(
   'title',
   'End the session now'
  )

  accountTray.append(
   message,
   traySpacer(theme),
   countdown,
   logoutButton
  )

  return {
   container: accountTray,
   destroy() {
    accountTray.remove()
    clearTimeout(countdownTimeout)
   },
   setExpiresAt,
   setMessage,
  }
 }

 const accountBanner = createAccountTray()

 async function render() {
  if (currentElement) {
   currentElement.destroy()
  }

  const auth = await getAuth()

  if (auth) {
   currentElement = onAuthenticated(auth.user)
   accountBanner.setMessage(
    `Welcome, ${auth.user.username}`
   )
   accountBanner.setExpiresAt(auth.expires_at)
   container.appendChild(
    accountBanner.container
   )
   container.appendChild(currentElement.element)
  } else {
   if (accountBanner.container.parentElement) {
    accountBanner.container.remove()
    accountBanner.setMessage('signed out')
   }
   currentElement = createAuthForm(
    theme,
    render
   )
   container.appendChild(currentElement.element)
  }
 }

 render()
}
