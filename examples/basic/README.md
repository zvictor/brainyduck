This example contains:

- a Graphql schema [Schema.graphql]
- a Graphql operations document [queries.gql]

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- a TypeScript typings file generated per schema [Schema.d.ts]
- a requests sdk containing all the operations, fully typed and with auto-complete support [faugra.sdk.ts]

Once your `faugra.sdk.ts` has been generated, you can run `FAUGRA_SECRET=<MY_FAUNA_SECRET> npm start` to see the operations demo.

[![asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/basic.gif)](https://asciinema.org/a/361433)
