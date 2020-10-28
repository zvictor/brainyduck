This example contains:

- a Graphql schema [Schema.graphql]
- a Graphql operations document [queries.gql]

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- a requests sdk containing all the operations, fully typed and with auto-complete support [accessible through `import sdk from 'faugra'`]

Once faugra has been setup, you can run `FAUGRA_SECRET=<MY_FAUNA_SECRET> npm start` to execute the operations demonstration [index.ts].

[![asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/basic.gif)](https://asciinema.org/a/361576)
