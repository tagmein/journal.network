export function createResponse(
 data: object,
 options: { status?: number } = {}
) {
 const responseBody = JSON.stringify(data)
 return new Response(responseBody, {
  status: options.status ?? 200,
  headers: {
   'Content-Length':
    responseBody.length.toString(),
   'Content-Type': 'application/json',
  },
  ...options,
 })
}
