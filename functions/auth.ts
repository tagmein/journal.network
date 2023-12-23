import {
 createAuth,
 getUserSession,
} from './lib/auth'
import { CloudflareWorker } from './lib/cloudflareTypes'
import { createResponse } from './lib/createResponse'
import { getKV } from './lib/getKV'

interface Body {
 username: string
 password: string
 'create-account': boolean
}

export const onRequestPost: CloudflareWorker =
 async function ({ env, request }) {
  const kv = await getKV(env)
  const body: Body = await request.json()

  const {
   access_token,
   expires_at,
   error,
   user,
  } = await createAuth(
   kv,
   body.username,
   body.password,
   body['create-account']
  )

  if (error) {
   return createResponse(
    { error },
    { status: 400 }
   )
  }

  return createResponse({
   access_token,
   expires_at,
   user,
  })
 }

export const onRequestGet: CloudflareWorker =
 async ({ env, request }) => {
  const access_token = request.headers.get(
   'Authorization'
  )

  if (!access_token) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }

  const kv = await getKV(env)

  const {
   user,
   session: { expires_at },
  } = await getUserSession(kv, access_token)

  if (!user) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }

  return createResponse({
   user,
   expires_at,
  })
 }
