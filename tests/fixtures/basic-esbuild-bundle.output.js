export default (results, name) => {
  console.log(`Basic-esbuild-bundle example ${name ? `- ${name} ` : ''}run:\n`, results)

  const parsedResults = JSON.parse(
    `[${results
      .replaceAll(`'`, `"`)
      .replace(/([\w]+):/gm, `"$1":`)
      .replace(/}[\s]*{/gm, '},{')}]`
  )

  expect(parsedResults.length).toBe(4)

  expect(parsedResults[0]).toEqual({
    createUser: {
      _id: expect.any(String),
      _ts: expect.any(Number),
      username: expect.stringContaining('rick-sanchez-'),
    },
  })

  expect(parsedResults[1]).toEqual({
    createUser: {
      _id: expect.any(String),
      _ts: expect.any(Number),
      username: expect.stringContaining('morty-smith-'),
    },
  })
  expect(parsedResults[2]).toEqual({
    _id: expect.any(String),
    _ts: expect.any(Number),
    username: expect.stringContaining('rick-sanchez-'),
  })
  expect(parsedResults[3]).toEqual({
    _id: expect.any(String),
    _ts: expect.any(Number),
    username: expect.stringContaining('morty-smith-'),
  })
}
