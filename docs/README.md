## Introduction

Brainyduck helps you transition your backend to a top notch serverless environment while keeping the developer experience neat! 🌈🍦🐥

Worry not about new and complex setup and deployment requisites: The graphql schemas you already have is all you need to build a world-class & reliable endpoint.

Just run `npx brainyduck` on your schemas and the times in which you had to manually setup your backend will forever be gone! Never find yourself redefining types in multiple files, ever again. 🥹

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Features

#### Code generation

- ⚡️&nbsp; Auto generated APIs with small footprint.
- 👮🏼&nbsp; The generated code is written in TypeScript, with full support for types.
- ⛰&nbsp; Schemas are [expanded to provide basic CRUD](https://docs.fauna.com/fauna/current/api/graphql/schemas) automatically (_i.e. no need to define resolvers for basic operations!_).
- 🔎&nbsp; Validation of required and non-nullable fields against provided data.

#### Backend (by Fauna)

- 🦄&nbsp; All the data persists on a [next-gen data backend](https://docs.fauna.com/fauna/current/introduction) 🤘.
- 👨‍👩‍👦‍👦&nbsp; Support for [relationships between documents](https://docs.fauna.com/fauna/current/learn/tutorials/graphql/relations/), within the schema definition.
- 🔒&nbsp; [Authentication and access control security](https://docs.fauna.com/fauna/current/security/) at the data level (including [Attribute-based access control (ABAC)](https://docs.fauna.com/fauna/current/security/abac)).


#### The library

- ✅&nbsp; Well-tested.
- 🐻&nbsp; Easy to add to your new or existing projects.
- 👀&nbsp; Quite a few examples in the [./examples](https://github.com/zvictor/brainyduck/tree/master/examples) folder.

<details>
  <summary><h4 style="display: inline">Read more</h4></summary>

Given a GraphQL schema looking anything like this:

```graphql
type User {
  username: String! @unique
}

type Post {
  content: String!
  author: User!
}
```

Brainyduck will give you:

1. Your schema will be expanded to provide basic CRUD out of the box. Expect it to become something like this:

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

2. Do you like TypeScript? Your schema will also be exported as TS types.

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

3. You will be able to abstract the GraphQL layer and make calls using a convenient API (with full autocomplete support!)

  ```typescript
  import brainyduck from 'brainyduck' // <-- automatically loads the SDK generated exclusively to your schema

  await brainyduck().createUser({ username: `rick-sanchez` }) // <-- TS autocomplete and type checking enabled!
  await brainyduck({ secret: 'different-access-token' }).createUser({ username: `morty-smith` }) // <-- Easily handle authentication and sessions by providing different credentials

  const { allUsers } = await brainyduck().allUsers()

  for (const user of allUsers.data) {
    console.log(user)
  }

  // output:
  //
  // { username: 'rick-sanchez' }
  // { username: 'morty-smith' }
  ```

4. The API can be used both on backend and frontend, as long as you are careful enough with your [secrets management](https://forums.fauna.com/t/do-i-need-a-backend-api-between-faunadb-and-my-app-what-are-the-use-cases-of-an-api/95/6?u=zvictor).

**What else?**

1. Brainyduck stiches multiple graphql files together, so your codebase can embrace [modularization](https://github.com/zvictor/brainyduck/tree/master/examples/modularized).
2. Isn't basic CRUD enough? What about more complex custom resolvers? Brainyduck integrates well with [user-defined functions [UDF]](https://docs.fauna.com/fauna/current/api/graphql/functions), automatically keeping your functions in sync with fauna's backend.


For more examples, please check our [examples directory](https://github.com/zvictor/brainyduck/tree/master/examples).
</details>

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Getting started

It takes only **3 steps to get started**:

1. Create a `.graphql` file defining your desired Graphql schema
2. Create or reuse a [fauna secret](https://github.com/zvictor/brainyduck/wiki/Fauna-secret)
3. In the same folder, run `npx brainyduck --secret <MY_FAUNA_SECRET>`

That's it! Now you can start importing and consuming your sdk with `import sdk from 'brainyduck'` 🐣🎉

_Alternatively, you can:_

- In any of our [examples](https://github.com/zvictor/brainyduck/tree/master/examples) folder, run `npx brainyduck --secret <MY_FAUNA_SECRET>`

|                                      [Basic](https://github.com/zvictor/brainyduck/tree/master/examples/basic)                                      |                                      [Modularized](https://github.com/zvictor/brainyduck/tree/master/examples/modularized)                                      |                                      [with-UDF](https://github.com/zvictor/brainyduck/tree/master/examples/with-UDF)                                      |
| :---------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Basic example asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/basic.gif)](https://asciinema.org/a/361576) | [![Modularized example asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/modularized.gif)](https://asciinema.org/a/361562) | [![with-UDF example asciicast](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/examples/with-UDF.gif)](https://asciinema.org/a/361573) |
|                                                                                                                                                 |

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Installation

You can install it globally, per project or just run it on demand:

```bash
  # npm, globally:
  $ npm install -g brainyduck

  # npm, project-only:
  $ npm i brainyduck -D

  # or run on demand:
  $ npx brainyduck
```

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Usage

```markup
Usage: brainyduck [options] [command]

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
  -f, --force <value>                                   skip prompt confirmations (defaults to <BRAINYDUCK_FORCE or true).
  -i, --ignore <value>                                  set glob patterns to exclude matches (defaults to <BRAINYDUCK_IGNORE or '**/node_modules/**,**/.git/**'>).
  --no-watch                                            disable the files watcher (only used in the dev command).
  --only-changes                                        ignore initial files and watch changes ONLY (only used in the dev command).
  --callback <command>                                  run external command after every execution completion (only used in the dev command).
  --tsconfig                                            use a custom tsconfig file for the sdk transpilation.
  --verbose                                             run the command with verbose logging.
  --debug [port]                                        run the command with debugging listening on [port].
  --debug-brk [port]                                    run the command with debugging(-brk) listening on [port].
  -h, --help                                            display help for command

Commands:
  build [schemas-pattern] [documents-pattern] [output]  code generator that creates an easily accessible API. Defaults: [schemas-pattern: **/[A-Z]*.(graphql|gql), documents-pattern: **/[a-z]*.(graphql|gql) output: <node_modules/brainyduck/.cache>]
  dev [directory]                                       build, deploy and watch for changes. Defaults: [directory: <pwd>]
  deploy [types]                                        deploy the local folder to your database. Defaults: [types: schemas,functions,indexes,roles]
  deploy-schemas [pattern]                              push your schema to faunadb. Defaults: [pattern: **/*.(graphql|gql)]
  deploy-functions [pattern]                            upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.udf]
  deploy-indexes [pattern]                              upload your User-Defined Indexes to faunadb. Defaults: [pattern: **/*.index]
  deploy-roles [pattern]                                upload your User-Defined Roles (UDR) to faunadb. Defaults: [pattern: **/*.role]
  pull-schema [output]                                  load the schema hosted in faunadb. Defaults: [output: <stdout>]
  reset [types]                                         wipe out all data in the database {BE CAREFUL!}. Defaults: [types: functions,indexes,roles,documents,collections,databases,schemas]
  help [command]                                        display help for command
```

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Commands

Commands with the **operative** badge require a `--secret` value to be passed along and are designed to make changes to the database associated to the given key.

Using a wrong secret can have unintended and possibly drastic effects on your data. So please **make sure you are using the right secret whenever running a command!**
### build

Throw graphql schemas in and get a well typed api back. Simple like that!

After running `build` you can add `import sdk from 'brainyduck'` statements in your code and run queries against your database directly.

CLI:
```shell
npx brainyduck build [schema-pattern] [documents-pattern] [output]
```

Defaults:
* _schema-pattern_: `**/[A-Z]*.(graphql|gql)`
* _documents-pattern_: `**/[a-z]*.(graphql|gql)`
* _output_: `<stdout>`

### dev
<div class="operative"></div>

[Builds](#build), [deploys](#deploy) (override mode), and watches for changes.

This is usually the command you run when you are developing locally, **never the command you run against production**.
You are recommended to create a secret in a new database, just for the dev environment, before running this command.

CLI:
```shell
npx brainyduck dev [directory]
```

Defaults:
* _directory_: `<pwd>`


### deploy
<div class="operative"></div>

Deploys [schemas](#deploy-schemas) (merge mode), [functions](#deploy-functions), [indexes](#deploy-indexes), and [roles](#deploy-roles).
This is usually the command you run when you have finished developing locally and want to ship to production. Just remember to use the right `--secret` value for that.

CLI:
```shell
npx brainyduck deploy [types]
```

Defaults:
* _types_: `schemas,functions,indexes,roles`

### deploy-schemas
<div class="operative"></div>

Deploys the selected schemas to your database, creating collections accordingly.

CLI:
```shell
npx brainyduck deploy-schemas [pattern]
```

Defaults:
* _pattern_: `**/*.(graphql|gql)`

### deploy-functions
<div class="operative"></div>

Deploys your [User-Defined Functions (UDF)](https://docs.fauna.com/fauna/current/build/fql/udfs).

CLI:
```shell
npx brainyduck deploy-functions [pattern]
```

Defaults:
* _pattern_: `**/*.udf`

### deploy-indexes
<div class="operative"></div>

Deploys your [User-Defined Indexes](https://docs.fauna.com/fauna/current/api/fql/indexes).

CLI:
```shell
npx brainyduck deploy-indexes [pattern]
```

Defaults:
* _pattern_: `**/*.index`

### deploy-roles
<div class="operative"></div>

Deploys your [User-Defined Roles (UDR)](https://docs.fauna.com/fauna/current/security/roles) to your database.

CLI:
```shell
npx brainyduck deploy-roles [pattern]
```

Defaults:
* _pattern_: `**/*.role`

### pull-schema
Downloads the schema from Fauna and outputs the result.
Useful only for debugging or inspecting purposes, otherwise used only internally.

CLI:
```shell
npx brainyduck pull-schema [output]
```

Defaults:
* _output_: `<stdout>`

### reset
<div class="operative"></div>

The fastest way to restart or get rid of data you don't want to keep anymore.

**BE CAREFUL, though, as the actions performed by `reset` are irreversible.** Please triple check your `--secret` before running this command!

CLI:
```shell
npx brainyduck reset [types]
```

Defaults:
* _types_: `functions,indexes,roles,documents,collections,databases,schemas`

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## CLI and Programmatic Access

All commands can be accessed in multiple ways.

Note that all CLI options have an equivalent environment variable you can set directly, as long as you follow the [constant case pattern](https://github.com/zvictor/brainyduck/blob/36f39d9b9e6c50654967b876767abdd905488b7c/cli.js#L18-L27) to do so.

Fauna options start with `FAUNA_` and all other ones start with `BRAINYDUCK_`.

E.g `--overwrite` becomes `BRAINYDUCK_OVERWRITE`; `--graphql-domain` becomes `FAUNA_GRAPHQL_DOMAIN`.

### Centralized CLI

Just run `npx brainyduck <command-name> [options]`.

For more information, please check [usage](#usage) or run `npx brainyduck --help`.

### Programmatically

Looking for fancy ways to automate your processes? You can import Brainyduck directly into your scripts, using the `import('brainyduck/<command-name>')` pattern, like shown in the example below:

```ts
import build from 'brainyduck/build'

await build()
```

### Direct CLI

You can access each command while skipping the CLI wrapper altogether.

```markup
node ./node_modules/brainyduck/commands/<command-name> [...args]
```

_The parameters of each script vary from file to file. You will need to [check the signature of each command](https://github.com/zvictor/brainyduck/tree/master/commands) on your own._


![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Bundling & Exporting

Your SDK files will be cached at `./node_modules/brainyduck/.cache`.

Most of the times you are developing you **don't need to worry about the location of those files as Brainyduck manages them for you** internally. Sometimes, however, (specially when bundling your projects) you might need to think on how to move them around and make sure that they stay available to your code regardless of changes in the environment.

For such cases, there a few strategies you can choose from:

### rebuild

It's okay to just rebuild your sdk in a new environment.

```Dockerfile
FROM node
...
ADD ./src .
RUN npm install
RUN npx brainyduck build
```

### clone

The files in Brainyduck's cache are portable, meaning that you can just copy them around.

_We wish all ducks could be cloned that easily!_ 🐣🧬🧑‍🔬


```Dockerfile
...
FROM node
...
ADD ./src .
RUN npm install
ADD ./node_modules/brainyduck/.cache ./node_modules/brainyduck/.cache
```

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Contributing

### Coding Principles
* Whenever possible the commands should be _non-operative_ (meaning that they can be run without altering the database its working with) and require no secret to execute.

* Separation of concerns: The CLI file is just a wrapper invoking each command file, and that separation must be clear.

### Debugging & Testing

1. When debugging Brainyduck, it's always a very good idea to run the commands using the `--verbose` (or `DEBUG=brainyduck:*`) flag.
Please make sure you **have that included in your logs before you report any bug**.

2. The tests are easy to run and are an important diagnosis tool to understand what could be going on in your environment.
Clone Brainyduck's repository and then run the tests in one of the possible ways:

**Note: Make sure you use a secret of a DB you create exclusively for these tests, as Brainyduck will potentially wipe all its data out!**

_Note: `TESTS_SECRET` needs to have `admin` role._

```haskell
-- Run all tests:
TESTS_SECRET=secret_for_an_exclusive_db ./tests/run-tests.sh
```

```haskell
-- Run only tests of a specific command:
TESTS_SECRET=secret_for_an_exclusive_db ./tests/run-tests.sh specs/<command-name>.js
```

You can also set `DEBUG=brainyduck:*` when running tests to get deeper insights.

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

## Sponsors

<p align="center"><a style="color: inherit" href="https://github.com/sponsors/zvictor?utm_source=brainyduck&utm_medium=sponsorship&utm_campaign=brainyduck&utm_id=brainyduck"><img width="150px" src="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/duck.png" alt="Brainyduck's logo" /><br />
Brainyduck needs your support!<br />
Please consider helping us spread the word of the Duck to the world. 🐥🙏
</a>
<p>

![divider](https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/divider.png ':size=100%')

<p align="center">
<sub><sup>Logo edited by <a href="https://github.com/zvictor">zvictor</a>, adapted from an illustration by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a><sub><sup>
</p>
