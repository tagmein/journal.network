import { createAuth } from './lib/auth'
import { authenticatedRequest } from './lib/authenticatedRequest'
import { createResponse } from './lib/createResponse'
import { errorSafeRequest } from './lib/errorSafeRequest'
import { getKV } from './lib/getKV'
import { CreateAuthRequestData } from './lib/types'

export const onRequestPost = errorSafeRequest(
 async function ({ env, request }) {
  const kv = await getKV(env)
  const data: CreateAuthRequestData =
   await request.json()
  const {
   access_token,
   expires_at,
   error,
   user,
  } = await createAuth(
   kv,
   data.username,
   data.password,
   data['create-account']
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
)

export const onRequestGet =
 authenticatedRequest(
  async (user, _, session) => {
   const { expires_at } = session
   return createResponse({
    user,
    expires_at,
   })
  }
 )
