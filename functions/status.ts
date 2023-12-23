import { CloudflareWorker } from './lib/cloudflareTypes'

export const onRequestGet: CloudflareWorker =
 async function () {
  return new Response(
   'status:ok Journal Network Platform is running normally'
  )
 }
