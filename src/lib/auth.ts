export interface User {
 created_at: string
 username: string
}

interface AuthCreateResponse {
 access_token: string
 expires_at: string
 user: User
}

interface AuthGetResponse {
 expires_at: number
 user: User
}

interface AuthError {
 error: string
}

export interface AccessTokenData {
 access_token: string
 expires_at: string
}

const accessTokenStorageKey =
 'system#access_token'

export async function createAuth(
 username: string,
 password: string,
 createAccount: boolean
): Promise<AuthCreateResponse | AuthError> {
 const response = await fetch('/auth', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
  },
  body: JSON.stringify({
   username,
   password,
   'create-account': createAccount,
  }),
 })

 if (!response.ok) {
  try {
   const responseBody = await response.json()
   if ('error' in responseBody) {
    return responseBody
   }
   console.error(responseBody)
   return {
    error: `http ${response.status}`,
   }
  } catch (e) {
   return { error: e.message }
  }
 }

 const data =
  (await response.json()) as AuthCreateResponse
 const { access_token, expires_at } = data
 localStorage.setItem(
  accessTokenStorageKey,
  JSON.stringify({
   access_token,
   expires_at,
  })
 )

 return data
}

export function getAccessToken():
 | string
 | undefined {
 const token = localStorage.getItem(
  accessTokenStorageKey
 )

 if (!token) {
  return
 }

 const { access_token, expires_at } =
  JSON.parse(token) as AccessTokenData

 if (
  Date.now() >= new Date(expires_at).getTime()
 ) {
  localStorage.removeItem(accessTokenStorageKey)
  return
 }

 return access_token
}
export async function getAuth(): Promise<
 AuthGetResponse | undefined
> {
 const accessToken = getAccessToken()

 if (!accessToken) {
  return
 }

 const response = await fetch('/auth', {
  headers: {
   Authorization: accessToken,
  },
 })

 if (!response.ok) {
  return
 }

 return (await response.json()) as AuthGetResponse
}

export async function clearAuth() {
 localStorage.removeItem(accessTokenStorageKey)
 return true
}
