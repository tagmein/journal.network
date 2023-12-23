import { PagesFunction } from '@cloudflare/workers-types'

interface Env {
 CIVIL_DATA_KV: KVNamespace
 CIVIL_DATA_BUCKET: R2Bucket
}

export type CloudflareWorker =
 PagesFunction<Env>
