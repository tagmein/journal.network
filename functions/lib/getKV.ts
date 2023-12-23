import { civilMemoryKV } from '@tagmein/civil-memory'

const LOCAL_KV_URL = 'http://localhost:3333'

export async function getKV(env: {
 CIVIL_DATA_KV: KVNamespace
}) {
 if (env.CIVIL_DATA_KV) {
  return civilMemoryKV.cloudflare({
   binding: env.CIVIL_DATA_KV,
  })
 } else {
  return civilMemoryKV.http({
   baseUrl: LOCAL_KV_URL,
  })
 }
}
