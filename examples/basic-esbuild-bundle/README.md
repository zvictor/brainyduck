<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-light.png">
    <img alt="Brainyduck's logo" src="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo.png">
  </picture>
<p>

# Basic Esbuild Bundle example

This example contains:

- a Graphql schema [Schema.graphql]
- a Graphql operations document [queries.gql]
- **a bundle made by esbuild while making use of the [brainyduck plugin](https://github.com/zvictor/brainyduck/tree/master/bundlers/esbuild)**

By running `npx brainyduck --secret <MY_FAUNA_SECRET>` you should expect to see:

- a requests sdk containing all the operations, fully typed and with auto-complete support [accessible through `import sdk from 'brainyduck'`]

Once brainyduck has been setup, you can run `FAUNA_SECRET=<MY_FAUNA_SECRET> npm start` to execute the operations demonstration [index.ts].

[![asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/basic.gif)](https://asciinema.org/a/361576)
