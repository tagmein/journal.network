import { PagesFunction } from '@cloudflare/workers-types'

interface Env {
 JOURNAL_NETWORK_DATA_KV: KVNamespace
}

export type CloudflareWorker =
 PagesFunction<Env>
