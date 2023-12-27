import {
 SessionData,
 User,
 getUserSession,
} from './auth'
import { createResponse } from './createResponse'
import { getKV } from './getKV'

export function authenticatedRequest(
 handler: (
  user: User,
  session: SessionData
 ) => Promise<Response>
) {
 return async ({ env, request }) => {
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

  try {
   const response = await handler(user, session)
   return response
  } catch (e) {
   return createResponse(
    { error: e.message },
    { status: 500 }
   )
  }
 }
}
