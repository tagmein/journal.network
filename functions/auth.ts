import {
 createAuth,
 getUserSession,
} from './lib/auth'
import { CloudflareWorker } from './lib/cloudflareTypes'
import { createResponse } from './lib/createResponse'
import { getKV } from './lib/getKV'

interface CreateAuthBody {
 username: string
 password: string
 'create-account': boolean
}

export const onRequestPost: CloudflareWorker =
 async function ({ env, request }) {
  try {
   const kv = await getKV(env)
   const body: CreateAuthBody =
    await request.json()
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
  } catch (e) {
   return createResponse(
    { error: e.message },
    { status: 500 }
   )
  }
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

  const { user, session } =
   await getUserSession(kv, access_token)

  if (!user || !session) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }

  const { expires_at } = session

  return createResponse({
   user,
   expires_at,
  })
 }
