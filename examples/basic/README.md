This example contains:

- a User-Defined Function (UDF) [sayHello.fql]
- two Graphql schemas [Query.graphql, User.gql]

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- The UDF uploaded to the cloud
- a TypeScript typings file generated per schema [Query.d.ts, User.d.ts]
