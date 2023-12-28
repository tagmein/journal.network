import { CivilMemoryKV } from '@tagmein/civil-memory'
import { User } from '../lib/auth'
import { Journal } from '../lib/types'

export const journalsData = {
 async getList(
  user: User,
  kv: CivilMemoryKV
 ): Promise<Journal[]> {
  try {
   const journalsList = await kv.get(
    `user.journals:${encodeURIComponent(
     user.username
    )}#list`
   )
   if (typeof journalsList === 'string') {
    return JSON.parse(journalsList)
   }
   return journalsList ?? []
  } catch (e) {
   return []
  }
 },
 async setList(
  user: User,
  kv: CivilMemoryKV,
  journals: Journal[]
 ) {
  await kv.set(
   `user.journals:${encodeURIComponent(
    user.username
   )}#list`,
   JSON.stringify(journals)
  )
 },
}
