import { getAccessToken } from './auth'

export interface KVDBPage {
 name: string
 content?: string
 url?: string
}

export interface KVDBDirectory {
 name: string
}

interface DeletedResponse {
 deleted: boolean
}

interface ExistsResponse {
 exists: boolean
}

interface SavedResponse {
 saved: boolean
}

interface DirectoryReadResponse {
 dir: KVDBDirectory
}

interface PageReadResponse {
 page: KVDBPage
}

interface DirectoryListResponse {
 dirs: string[]
}

interface PageListResponse {
 pages: string[]
}

export type KVDBResponse =
 | DeletedResponse
 | ExistsResponse
 | DirectoryReadResponse
 | PageReadResponse
 | DirectoryListResponse
 | PageListResponse
 | SavedResponse

export interface KVDBDirectoryTools {
 namespace: string
 enterNamespace(
  name: string
 ): KVDBDirectoryTools
 directory: {
  create(
   path: string[],
   name: string
  ): Promise<DirectoryReadResponse>
  delete(
   path: string[],
   name: string
  ): Promise<DeletedResponse>
  read(
   path: string[],
   name: string
  ): Promise<DirectoryReadResponse>
  list(
   path: string[]
  ): Promise<DirectoryListResponse>
  exists(
   path: string[],
   name: string
  ): Promise<ExistsResponse>
 }
 page: {
  create(
   path: string[],
   page: KVDBPage
  ): Promise<PageReadResponse>
  delete(
   path: string[],
   name: string
  ): Promise<DeletedResponse>
  read(
   path: string[],
   name: string
  ): Promise<PageReadResponse>
  save(
   path: string[],
   page: KVDBPage
  ): Promise<SavedResponse>
  list(
   path: string[]
  ): Promise<PageListResponse>
  exists(
   path: string[],
   name: string
  ): Promise<ExistsResponse>
 }
}

export function kvdb(
 namespace = ''
): KVDBDirectoryTools {
 async function request(
  operation: string,
  name?: string,
  body?: object
 ): Promise<KVDBResponse> {
  const params = new URLSearchParams()
  params.set('namespace', namespace)
  params.set('operation', operation)

  if (typeof name === 'string') {
   params.set('name', name)
  }

  const Authorization = getAccessToken()
  const url = '/data?' + params
  const response = body
   ? await fetch(url, {
      method: 'POST',
      headers: {
       ...(Authorization
        ? { Authorization }
        : {}),
       'Content-Type':
        'application/json',
      },
      body: JSON.stringify(body),
     })
   : await fetch(url)

  if (!response.ok) {
   throw new Error(
    `HTTP ${response.status} ${
     response.statusText
    } ${body ? 'POST' : 'GET'} ${url}`
   )
  }

  return response.json()
 }

 return {
  namespace,
  enterNamespace(name: string) {
   return kvdb(
    [namespace, name]
     .filter((x) => x.length)
     .join('/')
   )
  },
  directory: {
   async create(
    path: string[],
    name: string
   ) {
    return request(
     'directory.create',
     [...path, name].join('/'),
     { name }
    ) as Promise<DirectoryReadResponse>
   },

   async delete(
    path: string[],
    name: string
   ) {
    return request(
     'directory.delete',
     [...path, name].join('/'),
     {}
    ) as Promise<DeletedResponse>
   },

   async read(
    path: string[],
    name: string
   ) {
    return request(
     'directory.read',
     [...path, name].join('/')
    ) as Promise<DirectoryReadResponse>
   },

   async list(path: string[]) {
    return request(
     'directory.list',
     path.join('/')
    ) as Promise<DirectoryListResponse>
   },

   async exists(
    path: string[],
    name: string
   ) {
    return request(
     'directory.exists',
     [...path, name].join('/')
    ) as Promise<ExistsResponse>
   },
  },

  page: {
   async create(
    path: string[],
    page: KVDBPage
   ) {
    return request(
     'page.create',
     [...path, page.name].join('/'),
     page
    ) as Promise<PageReadResponse>
   },

   async delete(
    path: string[],
    name: string
   ) {
    return request(
     'page.delete',
     [...path, name].join('/'),
     {}
    ) as Promise<DeletedResponse>
   },

   async read(
    path: string[],
    name: string
   ) {
    return request(
     'page.read',
     [...path, name].join('/')
    ) as Promise<PageReadResponse>
   },

   async list(path: string[]) {
    return request(
     'page.list',
     path.join('/')
    ) as Promise<PageListResponse>
   },

   async exists(
    path: string[],
    name: string
   ) {
    return request(
     'page.exists',
     [...path, name].join('/')
    ) as Promise<ExistsResponse>
   },

   async save(
    path: string[],
    page: KVDBPage
   ) {
    return request(
     'page.save',
     [...path, page.name].join('/'),
     page
    ) as Promise<SavedResponse>
   },
  },
 }
}
