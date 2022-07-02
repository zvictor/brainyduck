export default (results, name) => {
  console.log(`Modularized example ${name ? `- ${name} ` : ''}run:\n`, results)

  const parsedResults = JSON.parse(
    results
      .split('\n')
      .slice(1)
      .join('\n')
      .replaceAll(`'`, `"`)
      .replace(/([\w]+):/gm, `"$1":`)
      .replace(/}[\s]*{/gm, '},{')
  )

  expect(parsedResults).toEqual({
    findPostByID: {
      author: {
        _id: expect.any(String),
        _ts: expect.any(Number),
        name: 'Whatever Name',
      },
      _id: expect.any(String),
      _ts: expect.any(Number),
      content: 'some post content',
      title: 'a post title',
    },
  })
}
