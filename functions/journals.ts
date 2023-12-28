import { journalsData } from './data/journalsData'
import { authenticatedRequest } from './lib/authenticatedRequest'
import { createResponse } from './lib/createResponse'
import { getKV } from './lib/getKV'
import {
 CreateJournalRequestData,
 Journal,
} from './lib/types'

export const onRequestPost =
 authenticatedRequest(async function (
  user,
  { env, request }
 ) {
  const kv = await getKV(env)
  const data: CreateJournalRequestData =
   await request.json()
  const journal: Journal = {
   createdAt: new Date().toISOString(),
   name: data.name,
   user: user.username,
  }
  const journals = await journalsData.getList(
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
  await journalsData.setList(user, kv, journals)
  return createResponse({
   journal,
  })
 })

export const onRequestGet =
 authenticatedRequest(async (user, { env }) => {
  const kv = await getKV(env)
  const journals = await journalsData.getList(
   user,
   kv
  )
  return createResponse({ journals })
 })
