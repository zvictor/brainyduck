## Why

Building world-class backend as a service became accessible with the advent of technologies such as graphql and faunadb. Within this new paradigm, a whole new setup and deployment requisites were introduced to your project development.

We have built Faugra to help you transition to a top notch serverless environment while keeping the developer experience neat! 🌈🍦🐥

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Getting started

It takes only **3 steps to get started**:

1. Create a `.graphql` file defining your desired Graphql schema
2. Create or reuse a [fauna secret](https://github.com/zvictor/faugra/wiki/Fauna-secret)
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
  -V, --version                                         output the version number
  -s, --secret <value>                                  set Fauna's secret key, used to deploy data to your database (defaults to <FAUNA_SECRET>).
  --domain <value>                                      FaunaDB server domain (defaults to <FAUNA_DOMAIN or 'db.fauna.com'>).
  --port <value>                                        Connection port (defaults to <FAUNA_PORT>).
  --graphql-domain <value>                              Graphql server domain (defaults to <FAUNA_GRAPHQL_DOMAIN or 'graphql.fauna.com'>).
  --graphql-port <value>                                Graphql connection port (defaults to <FAUNA_GRAPHQL_PORT>).
  --scheme <value>                                      Connection scheme (defaults to <FAUNA_SCHEME or 'https'>).
  --overwrite                                           wipe out data related to the command before its execution
  --no-operations-generation                            disable the auto-generated operations documents.
  -i, --ignore <value>                                  set glob patterns to exclude matches (defaults to <FAUGRA_IGNORE or '**/node_modules/**,**/.git/**'>).
  --no-watch                                            disable the files watcher (only used in the dev command).
  --watch-changes                                       ignore initial files and watch changes ONLY (only used in the dev command).
  --callback <command>                                  run external command after every execution completion (only used in the dev command).
  --tsconfig                                            use a custom tsconfig file for the sdk transpilation.
  --verbose                                             run the command with verbose logging.
  --debug [port]                                        run the command with debugging listening on [port].
  --debug-brk [port]                                    run the command with debugging(-brk) listening on [port].
  -h, --help                                            display help for command

Commands:
  build [schemas-pattern] [documents-pattern] [output]  code generator that creates an easily accessible API. Defaults: [schemas-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <FAUGRA_CACHE>]
  dev [directory]                                       build, deploy and watch for changes. Defaults: [directory: <pwd>]
  deploy [types]                                        deploy the local folder to your database. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]
  deploy-schemas [pattern]                              push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]
  deploy-functions [pattern]                            upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.udf]
  deploy-indexes [pattern]                              upload your User-Defined Indexes to faunadb. Defaults: [pattern: **/*.index]
  deploy-roles [pattern]                                upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: **/*.role]
  pull-schema [output]                                  load the schema hosted in faunadb. Defaults: [output: <stdout>]
  reset [types]                                         wipe out all data in the database {BE CAREFUL!}. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]
  help [command]                                        display help for command
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

## Bundling & Exporting

By default, your SDK files will be cached at `./node_modules/faugra/.cache`. _Note that you can customize it by defining a different value to the `FAUGRA_CACHE` env var._

Most of the times you are developing you **don't need to worry about the location of those files as Faugra manages them for you** internally. Sometimes, however, (specially when bundling your projects) you might need to think on how to move them around and make sure that they stay available to your code regardless of changes in the environment.

For such cases, there a few strategies you can choose from:

### rebuild

It's okay to just rebuild your sdk in a new environment.

```Dockerfile
FROM node
...
ADD ./src .
RUN npm install
RUN npx faugra build
```

### clone

The files in Faugra's cache are portable, meaning that you can just copy them around.

_We wish all ducks could be cloned that easily!_ 🐣🧬🧑‍🔬


```Dockerfile
...
ENV FAUGRA_CACHE /home/faugra
ADD ./node_modules/faugra/.cache $FAUGRA_CACHE
```

### bundle

We have built a special plugin to optimize the use of Faugra in Esbuild bundles.
This plugin reroutes any `import ... from 'faugra'` statement to import your SDK directly, without any wrapper from Faugra.

If you have `bundle: true` set in esbuild, your SDK code will be inlined in your built code and you won't need to worry about moving the SDK around. This is the recommended approach for many environments that don't work well with external dependencies, such as Cloudflare Workers.

Examples: [basic-esbuild-bundle](https://github.com/zvictor/faugra/tree/master/examples/basic-esbuild-bundle) / [modularized-esbuild-bundle](https://github.com/zvictor/faugra/tree/master/examples/modularized-esbuild-bundle)

Setup:
```ts
import { build } from 'esbuild'
import bundler from 'faugra/bundlers/esbuild'

await build({
  ...
  bundle: true,
  plugins: [bundler()],
})
```

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Contributing

1. When debugging Faugra, it's always a very good idea to run the commands using the `--verbose` (or `DEBUG=faugra:*`) flag.
Please make sure you **have that included in your logs before you report any bug**.

2. The tests are easy to run and are an important diagnosis tool to understand what could be going on in your environment.
Clone Faugra's repository and then run the tests in one of the possible ways:

**Note: Make sure you use a secret of a DB you create exclusivily for these tests, as Faugra will potentially wipe all its data out!**

_Note: `TESTS_SECRET` needs to have `admin` role._

```haskell
-- Run all tests:
TESTS_SECRET=secret_for_an_exclusive_db ./tests/run-tests.sh
```

```haskell
-- Run only tests of a specific command:
TESTS_SECRET=secret_for_an_exclusive_db ./tests/run-tests.sh specs/<command-name>.js
```

You can also set `DEBUG=faugra:*` when running tests to get deeper insights.

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

## Sponsors

<p align="center"><a style="color: inherit" href="https://github.com/sponsors/zvictor?utm_source=faugra&utm_medium=sponsorship&utm_campaign=faugra&utm_id=faugra"><img width="150px" src="https://cdn.jsdelivr.net/gh/zvictor/faugra@master/.media/logo.png" alt="Faugra's logo" /><br />
Faugra needs your support!<br />
Please consider helping us spread the word of the Duck to the world. 🐥🙏
</a>
<p>

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.media/divider.png ':size=100%')

<p align="center">
<sub><sup>Logo edited by <a href="https://github.com/zvictor">zvictor</a>, adapted from an illustration by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a><sub><sup>
</p>
