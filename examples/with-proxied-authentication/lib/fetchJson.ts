interface FetchError extends Error {
  response: Response
  data: any
}

export default async function fetchJson(
  url: string,
  { body, headers, ...options } = <{ [k: string]: any }>{}
) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    ...options,
    body: body && JSON.stringify(body),
  })

  if (!response.ok) {
    const error = <FetchError>new Error(response.statusText)
    error.response = response

    try {
      error.data = await response.clone().json()
    } catch (e) {
      error.data = await response.text()
    }

    if (error.data.error) {
      error.message = error.data.error
    }

    throw error
  }

  return await response.json()
}
