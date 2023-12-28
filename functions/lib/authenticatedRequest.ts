import {
 SessionData,
 User,
 getUserSession,
} from './auth'
import {
 CloudflareWorker,
 JournalNetworkEnv,
} from './cloudflareTypes'
import { createResponse } from './createResponse'
import { errorSafeRequest } from './errorSafeRequest'
import { getKV } from './getKV'

export function authenticatedRequest(
 handler: (
  user: User,
  context: EventContext<
   JournalNetworkEnv,
   string,
   any
  >,
  session: SessionData
 ) => Promise<Response>
): CloudflareWorker {
 return errorSafeRequest(async (context) => {
  const access_token =
   context.request.headers.get('Authorization')

  if (!access_token) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }

  const kv = await getKV(context.env)

  const { user, session } =
   await getUserSession(kv, access_token)

  if (!user || !session) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }

  return handler(
   user,
   context as EventContext<
    JournalNetworkEnv,
    string,
    any
   >,
   session
  )
 })
}
