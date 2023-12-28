import { PagesFunction } from '@cloudflare/workers-types'

export interface JournalNetworkEnv {
 JOURNAL_NETWORK_DATA_KV: KVNamespace
}

export type CloudflareWorker =
 PagesFunction<JournalNetworkEnv>
