<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-light.png">
    <img alt="Brainyduck's logo" src="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo.png">
  </picture>
<p>

# Modularized example

This example contains:

- an [ECMAScript module](https://nodejs.org/api/esm.html)
- multiple graphql schemas and User-Defined Function (UDF) spread in 2 **different folders**
- a root graphql schema containing the Query type

By running `npx brainyduck --secret <MY_FAUNA_SECRET>` you should expect to see:

- all UDF uploaded to the cloud
- a requests sdk containing all the operations, fully typed and with auto-complete support [accessible through `import sdk from 'brainyduck'`]

Once brainyduck has been setup, you can run `FAUNA_SECRET=<MY_FAUNA_SECRET> npm start` to execute the operations demonstration [index.ts].

[![asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/modularized.gif)](https://asciinema.org/a/361562)
