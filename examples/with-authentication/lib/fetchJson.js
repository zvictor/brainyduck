export default async function fetchJson(url, { body, ...options } = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
    body: body && JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(response.statusText)
    error.response = response
    error.data = data

    if (data.error) {
      error.message = data.error
    }

    throw error
  }

  return data
}
