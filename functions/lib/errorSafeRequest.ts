import { CloudflareWorker } from './cloudflareTypes'
import { createResponse } from './createResponse'

export function errorSafeRequest(
 handler: CloudflareWorker
): CloudflareWorker {
 return async function (context) {
  try {
   const response = await handler(context)
   return response
  } catch (e) {
   return createResponse(
    { error: e.message },
    { status: 500 }
   )
  }
 }
}
