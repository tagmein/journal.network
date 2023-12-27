import {
 SessionData,
 User,
 createAuth,
 getUserSession,
} from './lib/auth'
import { authenticatedRequest } from './lib/authenticatedRequest'
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
 authenticatedRequest(async (user, session) => {
  const { expires_at } = session
  return createResponse({
   user,
   expires_at,
  })
 })
