<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-light.png">
    <img width="280px" alt="Brainyduck's logo" src="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo.png">
  </picture>
<p>

# with user-defined-functions example

This example contains:

- a User-Defined Function (UDF) with simplified definition [sayHi.udf]
- a User-Defined Function (UDF) with extended definition [sayHello.udf]
- a User-Defined Role (UDR) [publicAccess.role]
- a Graphql schema [Schema.graphql]
- a Graphql operations document [queries.gql]

By running `npx brainyduck --secret <MY_FAUNA_SECRET>` you should expect to see:

- The UDF and UDR uploaded to the cloud
- a requests sdk containing all the operations, fully typed and with auto-complete support [accessible through `import sdk from 'brainyduck'`]

Once brainyduck has been setup, you can run `FAUNA_SECRET=<MY_FAUNA_SECRET> npm start` to execute the operations demonstration [index.ts].

[![asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/with-UDF.gif)](https://asciinema.org/a/361573)
