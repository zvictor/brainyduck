## Why

Building world-class backend as a service became accessible with the advent of technologies such as graphql and faunadb. Within this new paradigm, a whole new setup and deployment requisites were introduced to your project development.

We have built Faugra to help you transition to a top notch serverless environment while keeping the developer experience neat! 🌈🍦🐥

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Getting started

It takes only **3 steps to get started**:

1. Create a `.graphql` file defining your desired Graphql schema
2. Create or reuse a [Faugra secret](https://github.com/zvictor/faugra/wiki/Faugra-secret)
3. In the same folder, run `npx faugra --secret <MY_FAUNA_SECRET>`

That's it! Now you can start importing and consuming your sdk with `import sdk from 'faugra'` 🐣🎉

_Alternatively, you can:_

- In any of our [examples](https://github.com/zvictor/faugra/tree/master/examples) folder, run `npx faugra --secret <MY_FAUNA_SECRET>`

|                                      [Basic](https://github.com/zvictor/faugra/tree/master/examples/basic)                                      |                                      [Modularized](https://github.com/zvictor/faugra/tree/master/examples/modularized)                                      |                                      [with-UDF](https://github.com/zvictor/faugra/tree/master/examples/with-UDF)                                      |
| :---------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Basic example asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/basic.gif)](https://asciinema.org/a/361576) | [![Modularized example asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/modularized.gif)](https://asciinema.org/a/361562) | [![with-UDF example asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/with-UDF.gif)](https://asciinema.org/a/361573) |
|                                                                                                                                                 |

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Installation

You can install it globally, per project or just run it on demand:

```bash
  # npm, globally:
  $ npm install -g faugra

  # npm, project-only:
  $ npm i faugra -D

  # or run on demand:
  $ npx faugra
```

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Usage

```markup
Usage: faugra [options] [command]

Options:
  -V, --version                                            output the version number
  -s, --secret <value>                                     set Fauna's secret key, used to push/pull schemas to and from the database (defaults to <FAUGRA_SECRET>).
  --domain <value>                                         FaunaDB server domain (defaults to <FAUGRA_DOMAIN or 'db.fauna.com'>).
  --port <value>                                           Connection port (defaults to <FAUGRA_PORT>).
  --graphql-domain <value>                                 Graphql server domain (defaults to <FAUGRA_GRAPHQL_DOMAIN or 'graphql.fauna.com'>).
  --graphql-port <value>                                   Graphql connection port (defaults to <FAUGRA_GRAPHQL_PORT>).
  --scheme <value>                                         Connection scheme (defaults to <FAUGRA_SCHEME or 'https'>).
  --overwrite                                              wipe out data related to the command before its execution
  -i, --ignore <value>                                     set glob patterns to exclude matches (defaults to <FAUGRA_IGNORE or '**/node_modules/**,**/.git/**'>).
  --no-watch                                               disable the files watcher (only used in the dev command).
  --watch-changes                                          ignore initial files and watch changes ONLY (only used in the dev command).
  --callback <command>                                     run external command after every execution completion (only used in the dev command).
  --tsconfig                                               use a custom tsconfig file for the sdk transpilation.
  --verbose                                                run the command with verbose logging.
  --debug [port]                                           run the command with debugging listening on [port].
  --debug-brk [port]                                       run the command with debugging(-brk) listening on [port].
  -h, --help                                               display help for command

Commands:
  dev [directory]                                          watch for changes and run helpers accordingly. Defaults: [directory: <pwd>]
  define-functions [pattern]                               upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.udf]
  define-indexes [pattern]                                 upload your User-Defined Indexes to faunadb. Defaults: [pattern: **/*.index]
  define-roles [pattern]                                   upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: **/*.role]
  pull-schema [output]                                     load the schema hosted in faunadb. Defaults: [output: <stdout>]
  push-schema [pattern]                                    push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]
  generate-types [pattern] [output]                        code generator that converts graphql schemas into typescript types. Defaults: [pattern: **/[A-Z]*.(graphql|gql), output: <stdout>]
  build-sdk [schema-pattern] [documents-pattern] [output]  code generator that creates an easily accessible API. Defaults: [schema-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <stdout>]
  reset                                                    wipe out all data in the database [Be careful!]
  help [command]                                           display help for command
```

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Features

Given a GraphQL schema looking anything like this:

```graphql
# Schema.gql ↓

type User {
  username: String! @unique
}

type Post {
  content: String!
  author: User!
}

# queries.gql ↓

mutation createUser($data: UserInput!) {
  createUser(data: $data) {
    _id
  }
}

query allUsers {
  allUsers {
    data {
      username
    }
  }
}
```

Faugra will give you:

1. A [full-featured data backend](https://docs.fauna.com/fauna/current/introduction) in which your original schema will be [expanded to provide basic CRUD out of the box](https://docs.fauna.com/fauna/current/api/graphql/schemas) (i.e. no need to define resolvers for basic operations!). Expect it to look like this:

   <details>
      <summary>auto-expanded schema</summary>

   ```graphql
   type Query {
     findPostByID(id: ID!): Post
     findUserByID(id: ID!): User
   }

   type Mutation {
     updateUser(id: ID!, data: UserInput!): User
     createUser(data: UserInput!): User!
     updatePost(id: ID!, data: PostInput!): Post
     deleteUser(id: ID!): User
     deletePost(id: ID!): Post
     createPost(data: PostInput!): Post!
   }

   type Post {
     author: User!
     _id: ID!
     content: String!
     title: String!
   }

   type User {
     _id: ID!
     username: String!
   }

   input PostInput {
     title: String!
     content: String!
     author: PostAuthorRelation
   }

   input UserInput {
     username: String!
   }

   # ... plus few other less important definitions such as relations and pagination
   ```

   </details>

1. Do you like TypeScript? Your schema will also be exported as TS types.

   <details>
      <summary>TS types</summary>

   ```typescript
   export type Query = {
     __typename?: 'Query'
     /** Find a document from the collection of 'Post' by its id. */
     findPostByID?: Maybe<Post>
     /** Find a document from the collection of 'User' by its id. */
     findUserByID?: Maybe<User>
   }

   export type Mutation = {
     __typename?: 'Mutation'
     /** Update an existing document in the collection of 'User' */
     updateUser?: Maybe<User>
     /** Create a new document in the collection of 'User' */
     createUser: User
     /** Update an existing document in the collection of 'Post' */
     updatePost?: Maybe<Post>
     /** Delete an existing document in the collection of 'User' */
     deleteUser?: Maybe<User>
     /** Delete an existing document in the collection of 'Post' */
     deletePost?: Maybe<Post>
     /** Create a new document in the collection of 'Post' */
     createPost: Post
   }

   export type Post = {
     __typename?: 'Post'
     author: User
     /** The document's ID. */
     _id: Scalars['ID']
     content: Scalars['String']
     title: Scalars['String']
   }

   export type User = {
     __typename?: 'User'
     /** The document's ID. */
     _id: Scalars['ID']
     username: Scalars['String']
   }

   // ... plus few other less important definitions such as relations and pagination
   ```

   </details>

1. You will be able to abstract the GraphQL layer and make calls using a convenient API (with full autocomplete support!)

   <details>
      <summary>your-code.js</summary>

   ```typescript
   import faugra from 'faugra' // <-- automatically loads the SDK generated exclusively to your schema

   await faugra().createUser({ username: `rick-sanchez` }) // <-- TS autocomplete and type checking enabled!
   await faugra({ secret: 'different-access-token' }).createUser({ username: `morty-smith` }) // <-- Easily handle authentication and sessions by providing different credentials

   const { allUsers } = await faugra().allUsers()

   for (const user of allUsers.data) {
     console.log(user)
   }

   // output:
   //
   // { username: 'rick-sanchez' }
   // { username: 'morty-smith' }
   ```

   </details>

1. The API can be used both on backend and frontend, as long as you are careful enough with your [secrets management](https://forums.fauna.com/t/do-i-need-a-backend-api-between-faunadb-and-my-app-what-are-the-use-cases-of-an-api/95/6?u=zvictor).

**What else?**

1. Faugra stiches multiple graphql files together, so your codebase can embrace [modularization](https://github.com/zvictor/faugra/tree/master/examples/modularized).
2. Isn't basic CRUD enough? What about more complex custom resolvers? Faugra integrates well with [user-defined functions [UDF]](https://docs.fauna.com/fauna/current/api/graphql/functions), automatically keeping your functions in sync with fauna's backend.
3. Built-in state of the art [authentication and access control security](https://docs.fauna.com/fauna/current/security/) (including [Attribute-based access control (ABAC)](https://docs.fauna.com/fauna/current/security/abac)) provided by FaunaDB.

For more examples, please check our [examples directory](https://github.com/zvictor/faugra/tree/master/examples).

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Sponsors

<p align="center"><a href="https://join.feats.co/?utm_source=zvictor&utm_medium=sponsorship&utm_campaign=zvictor&utm_id=zvictor"><img width="150px" src="https://www.feats.co/static/logos/black/white-background/feats-logo-100.png" alt="Feats's logo" /></a><br />
Feats is a new professional network for people who build products, brands, and businesses.<br />
Uniting people behind projects to create meaningful opportunities for all.
<p>

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

<p align="center">
<sub><sup>Logo edited by <a href="https://github.com/zvictor">zvictor</a>, adapted from an illustration by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a><sub><sup>
</p>
