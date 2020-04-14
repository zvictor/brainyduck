This example contains:

- a User-Defined Function (UDF) [sayHello.fql]
- two Graphql schemas [Query.graphql, User.gql]
- a Graphql operations document [queries.gql]

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- The UDF uploaded to the cloud
- a TypeScript typings file generated per schema [Query.d.ts, User.d.ts]
- a requests sdk containing all the operations [faugra.sdk.ts]

Once your `faugra.sdk.ts` has been generated, you can run `FAUGRA_SECRET=<MY_FAUNA_SECRET> npx ts-node index.ts` to see the operations demo.
