import { getAccessToken } from './auth'

export interface Journal {
 createdAt: string
 name: string
}

export const journals = {
 async create(name: string): Promise<Journal> {
  const Authorization = getAccessToken()
  if (!Authorization) {
   throw new Error('unauthorized')
  }
  const response = await fetch('/journals', {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    Authorization,
   },
   body: JSON.stringify({ name }),
  })
  const data = await response.json()
  if (!response.ok) {
   throw new Error(data.error)
  }
  return data.journal
 },

 async list(): Promise<Journal[]> {
  const Authorization = getAccessToken()
  if (!Authorization) {
   throw new Error('unauthorized')
  }
  const response = await fetch('/journals', {
   headers: {
    Authorization,
   },
  })

  const data = await response.json()

  if (!response.ok) {
   throw new Error(data.error)
  }
  return data.journals
 },
}
