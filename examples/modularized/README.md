This example contains:

- multiple graphql schemas and User-Defined Function (UDF) spread in 2 different folders
- a root graphql schema containing the Query type

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- all UDF uploaded to the cloud
- a TypeScript typings file generated next to their respective schema [Query.d.ts, accounts/User.d.ts, blog/Post.d.ts]
- a requests sdk containing all the operations, fully typed and with auto-complete support [faugra.sdk.ts]

Once your `faugra.sdk.ts` has been generated, you can run `FAUGRA_SECRET=<MY_FAUNA_SECRET> npm start` to see the operations demo.

[![asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/modularized.gif)](https://asciinema.org/a/361562)
