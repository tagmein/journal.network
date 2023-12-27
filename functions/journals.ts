import { CivilMemoryKV } from '@tagmein/civil-memory'
import {
 User,
 getUserSession,
} from './lib/auth'
import { CloudflareWorker } from './lib/cloudflareTypes'
import { createResponse } from './lib/createResponse'
import { getKV } from './lib/getKV'

interface CreateJournalBody {
 name: string
}

interface Journal {
 createdAt: string
 name: string
}

async function getJournalsList(
 user: User,
 kv: CivilMemoryKV
) {
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
}

async function setJournalsList(
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
}

export const onRequestPost: CloudflareWorker =
 async function ({ env, request }) {
  try {
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
   const { user } = await getUserSession(
    kv,
    access_token
   )
   if (!user) {
    return createResponse(
     { error: 'unauthorized' },
     { status: 401 }
    )
   }
   const body: CreateJournalBody =
    await request.json()
   const journal: Journal = {
    createdAt: new Date().toISOString(),
    name: body.name,
   }
   const journals = await getJournalsList(
    user,
    kv
   )
   if (
    journals.find(
     (x: Journal) =>
      x.name.toLowerCase() ===
      journal.name.toLowerCase()
    )
   ) {
    return createResponse({
     error: `journal with name ${JSON.stringify(
      journal.name
     )} already exists`,
    })
   }
   journals.push(journal)
   await setJournalsList(user, kv, journals)
   return createResponse({
    journal,
   })
  } catch (e) {
   return createResponse(
    { error: e.message },
    { status: 500 }
   )
  }
 }

export const onRequestGet: CloudflareWorker =
 async ({ env, request }) => {
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
  const { user } = await getUserSession(
   kv,
   access_token
  )
  if (!user) {
   return createResponse(
    { error: 'unauthorized' },
    { status: 401 }
   )
  }
  const journals = await getJournalsList(
   user,
   kv
  )
  return createResponse({ journals })
 }
