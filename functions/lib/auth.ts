import { CivilMemoryKV } from '@tagmein/civil-memory'
import {
 createHash,
 randomBytes,
} from 'node:crypto'

const authNamespace = 'system/auth'

const TIME_ONE_DAY = 24 * 60 * 60 * 1000 // 24 hours

export function validateUsername(
 username: string
) {
 if (
  !/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/.test(
   username
  )
 ) {
  throw Error(
   'Invalid username, must be letters a-z and numbers only, and . - _ which can not be at the start or end'
  )
 }
}

export function hash(
 data: string,
 salt: string
) {
 return createHash('sha256')
  .update(data + salt)
  .digest('hex')
}

export function createAccessToken() {
 return randomBytes(48).toString('hex')
}

export function createSalt() {
 return randomBytes(48).toString('hex')
}

export async function compare(
 data: string,
 salt: string,
 hashed: string
) {
 return (
  createHash('sha256')
   .update(data + salt)
   .digest('hex') === hashed
 )
}

export async function compareFixedTime(
 data: string,
 hashed: string,
 salt: string,
 duration = 5e3
) {
 let result = false
 await new Promise((r) => {
  setTimeout(
   r,
   duration + Math.random() * duration * 0.1
  )
  result =
   createHash('sha256')
    .update(data + salt)
    .digest('hex') === hashed
 })
 return result
}

export interface SessionData {
 created_at: number
 expires_at: number
 username: string
}

export interface UserData {
 created_at: number
 password_hash: string
 password_hash_salt: string
 password_modified_at: number
 username: string
}

export async function getUserSession(
 kv: CivilMemoryKV,
 access_token: string
): Promise<
 | {
    session: SessionData
    user: User
   }
 | {
    session: null
    user: null
   }
> {
 const sessionKey = `${authNamespace}#sessions/${access_token}`
 const sessionString = await kv.get(sessionKey)
 const session = sessionString
  ? (JSON.parse(sessionString) as SessionData)
  : undefined

 if (!session) {
  return {
   session: null,
   user: null,
  }
 }

 const userKey = `${authNamespace}#user-accounts/${session.username.toLowerCase()}`
 const userString = await kv.get(userKey)
 const user = userString
  ? (JSON.parse(userString) as UserData)
  : undefined

 if (!user) {
  return {
   session: null,
   user: null,
  }
 }

 return {
  session,
  user: formatUser(user),
 }
}

export async function createAccessTokenForUser(
 kv: CivilMemoryKV,
 user: UserData,
 expiration_ttl = TIME_ONE_DAY
) {
 const access_token = createAccessToken()
 const created_at = Date.now()
 const expires_at = created_at + expiration_ttl

 const session: SessionData = {
  created_at,
  expires_at,
  username: user.username,
 }

 const sessionKey = `${authNamespace}#sessions/${access_token}`
 await kv.set(
  sessionKey,
  JSON.stringify(session)
 )

 return {
  access_token: `${access_token}`,
  expires_at,
 }
}

export async function createAuth(
 kv: CivilMemoryKV,
 _username: string,
 password: string,
 createAccount: boolean
) {
 try {
  validateUsername(_username)
 } catch (e) {
  return { error: e.message }
 }
 if (password.length < 12) {
  return {
   error:
    'Password must be at least 12 characters',
  }
 }
 const username = _username.toLowerCase()
 const userKey = `${authNamespace}#user-accounts/${username}`
 const userString = await kv.get(userKey)
 let user: UserData | undefined = userString
  ? (JSON.parse(userString) as UserData)
  : undefined

 if (user) {
  const { password_hash, password_hash_salt } =
   user
  const passwordsAreEqual =
   await compareFixedTime(
    password,
    password_hash,
    password_hash_salt
   )
  console.log(
   'passwordsAreEqual',
   passwordsAreEqual
  )
  if (!passwordsAreEqual) {
   return { error: 'Invalid password' }
  }
 } else if (createAccount) {
  const password_hash_salt = createSalt()
  const password_hash = hash(
   password,
   password_hash_salt
  )
  const created_at = Date.now()
  user = {
   created_at,
   password_hash,
   password_hash_salt,
   password_modified_at: created_at,
   username,
  }
  await kv.set(userKey, JSON.stringify(user))
 } else {
  return {
   error: 'User does not exist',
  }
 }

 const { access_token, expires_at } =
  await createAccessTokenForUser(kv, user)

 return {
  access_token,
  expires_at: new Date(
   expires_at
  ).toISOString(),
  user: formatUser(user),
 }
}

export interface User {
 created_at: string
 username: string
}

function formatUser(user: UserData): User {
 return {
  created_at: new Date(
   user.created_at
  ).toISOString(),
  username: user.username,
 }
}
