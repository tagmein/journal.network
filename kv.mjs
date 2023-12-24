import {
 mkdir,
 readFile,
 unlink,
 writeFile,
} from 'fs/promises'
import http from 'http'
import { dirname, join } from 'path'
import querystring from 'querystring'

const DEFAULT_PORT = 3333

const ENCODING_JSON = 'application/json'
const ENCODING_PLAIN = 'text/plain'

const MAX_REQUEST_BODY_SIZE = 65536

const STORAGE_DIR = join(
 dirname(
  import.meta.url.replace('file://', '')
 ),
 '.tmp-kv'
)

async function main() {
 const portEnv = parseInt(
  process.env.PORT,
  10
 )
 const port =
  Number.isFinite(portEnv) &&
  portEnv >= 1 &&
  portEnv < 65536
   ? portEnv
   : DEFAULT_PORT

 async function diskPath(
  namespace,
  key
 ) {
  const namespaceDirPath = join(
   STORAGE_DIR,
   encodeURIComponent(namespace)
  )
  await mkdir(namespaceDirPath, {
   recursive: true,
   // todo cache our knowledge that the directory
   // exists for performance enhancement here
  })
  return join(
   STORAGE_DIR,
   encodeURIComponent(namespace),
   encodeURIComponent(key)
  )
 }

 const diskMap = /* undefined && */ {
  async delete(key) {
   const namespace = key.split('#')[0]
   try {
    await unlink(
     await diskPath(namespace, key)
    )
    return true
   } catch (e) {
    return false
   }
  },
  async get(key) {
   const namespace = key.split('#')[0]
   try {
    return (
     await readFile(
      await diskPath(namespace, key)
     )
    ).toString('utf8')
   } catch (e) {
    return null
   }
  },
  async set(key, value) {
   const namespace = key.split('#')[0]
   await writeFile(
    await diskPath(namespace, key),
    value,
    'utf8'
   )
  },
 }

 await mkdir(STORAGE_DIR, {
  recursive: true,
 })

 const MEMORY = diskMap ?? new Map()
 const MEMORY_EXPIRE_KEY = new Map()

 const httpServer = http.createServer(
  async function (request, response) {
   try {
    const [
     requestPath,
     requestParamString,
    ] = request.url.split('?')
    const requestParams =
     querystring.parse(
      requestParamString ?? ''
     )
    console.log(
     request.method,
     requestPath,
     JSON.stringify(requestParams)
    )
    switch (request.method) {
     case 'DELETE':
      response.statusCode = 200
      response.end(
       (
        await MEMORY.delete(
         requestParams.key
        )
       ).toString()
      )
      return
     case 'GET':
      response.statusCode = 200
      response.end(
       (await MEMORY.get(
        requestParams.key
       )) ?? ''
      )
      return
     case 'POST':
      const requestBody =
       await collectBody(request)
      await MEMORY.set(
       requestParams.key,
       requestBody
      )
      response.statusCode = 200
      const ttl = parseInt(
       requestParams.expiration_ttl,
       10
      )
      clearTimeout(
       MEMORY_EXPIRE_KEY.get(
        requestParams.key
       )
      )
      async function eraseMemoryKey() {
       await MEMORY.delete(
        requestParams.key
       )
      }
      if (!isNaN(ttl)) {
       MEMORY_EXPIRE_KEY.set(
        requestParams.key,
        setTimeout(eraseMemoryKey, ttl)
       )
      }
      response.end()
      return
     default:
      response.statusCode = 405
      response.end('invalid method')
      return
    }
   } catch (e) {
    console.error(e)
    response.statusCode =
     e.statusCode ?? 500
    response.setHeader(
     'Content-Type',
     'text/plain; charset=utf-8'
    )
    response.end(e.message)
   }
  }
 )

 httpServer.listen(
  port,
  'localhost',
  function () {
   console.log(
    `Server listening on http://localhost:${port}`
   )
   console.log('Available operations:')
   console.log('')
   console.log(' • Read value at key')
   console.log(
    '      GET ?key=urlEncodedKey'
   )
   console.log('')
   console.log(' • Delete value at key')
   console.log(
    '   DELETE ?key=urlEncodedKey'
   )
   console.log('')
   console.log(
    ' • Write value at key (expires in 60 seconds)'
   )
   console.log(
    '     POST ?key=urlEncodedKey&expiration_ttl=60 <body>'
   )
   console.log('')
  }
 )
}

main().catch(function (e) {
 console.error(e)
})

async function collectBody(request) {
 return new Promise(function (
  resolve,
  reject
 ) {
  let error = false
  const contentTypeHeader =
   request.headers['content-type'] ?? ''
  const [contentType] =
   contentTypeHeader.split(';')

  if (contentType === ENCODING_JSON) {
   const bodyChunks = []
   let bodySize = 0
   request.on('data', function (chunk) {
    if (!error) {
     bodyChunks.push(chunk)
     bodySize += chunk.length
     if (
      bodySize > MAX_REQUEST_BODY_SIZE
     ) {
      error = true
      reject(
       new Error(
        `request body size cannot exceed ${MAX_REQUEST_BODY_SIZE} bytes`
       )
      )
     }
    }
   })
   request.on('end', function () {
    if (!error) {
     resolve(
      JSON.parse(
       Buffer.concat(bodyChunks)
      )
     )
    }
   })
  } else if (
   contentType === ENCODING_PLAIN
  ) {
   const bodyChunks = []
   let bodySize = 0
   request.on('data', function (chunk) {
    if (!error) {
     bodyChunks.push(chunk)
     bodySize += chunk.length
     if (
      bodySize > MAX_REQUEST_BODY_SIZE
     ) {
      error = true
      reject(
       new Error(
        `request body size cannot exceed ${MAX_REQUEST_BODY_SIZE} bytes`
       )
      )
     }
    }
   })
   request.on('end', function () {
    if (!error) {
     resolve(Buffer.concat(bodyChunks))
    }
   })
  } else {
   resolve({})
  }
 })
}
