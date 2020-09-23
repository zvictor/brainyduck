<p align="center"><img src="https://raw.githubusercontent.com/zvictor/faugra/master/.design/logo.jpg" alt="faugra's logo" /><p>
<br>

<p align="center">
<strong>A micro "no-backend" backend framework 🤯</strong><br />
<sub>faugra is an opinionated approach to quickly building powerful backends while leveraging on the power of FAUnadb + GRAphql.</sub>
</p>

<p align="center">
  [ <a href="#getting-started">Getting started 🤓</a> | <a href="#getting-started">Installation 💾</a> | <a href="#usage">Usage 🦆</a> | <a href="https://github.com/zvictor/faugra/tree/master/examples">Examples 🌈 </a> | <a href="https://www.npmjs.com/package/faugra">NPM 📦</a> | <a href="https://github.com/zvictor/faugra">Github 🕸</a> ]
</p>
<br />

⚠️ This tool is currently in Preview mode, in a very early phase of development. Expect broken behaviour to be the norm for now! If you like the idea, though, [please help us tackle the issues we have found!](https://github.com/zvictor/faugra/issues)

## Getting started

It takes just **2 steps to get started**:

1. Create a `.graphql` file defining your desired Graphql schema
2. In the same folder, run `npx faugra --secret <MY_FAUNA_SECRET>`

_Alternatively, you can:_

1. Clone this repo: `git clone https://github.com/zvictor/faugra.git`
2. In the `examples/basic` or `examples/modularized` folders, run `npx faugra --secret <MY_FAUNA_SECRET>`

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.design/divider.png)

## What does it do?

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

1. A [full-featured data backend](https://docs.fauna.com/fauna/current/introduction) in which your original schema will be expanded to provide basic CRUD out of the box (i.e. no need to define resolvers for basic operations!). Expect it to look like this:

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

2. Do you like TypeScript? Your schema will also be exported as TS types.

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

3. You will be able to abstract the GraphQL layer and make calls using a convenient API (with full autocomplete support!)

   <details>
      <summary>your-code.js</summary>

   ```typescript
   import faugra from './fraugra.sdk.ts' // <-- auto generated file based on your schema

   await faugra().createUser({ username: `rick-sanchez` })
   await faugra().createUser({ username: `morty-smith` })

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

**What else?**

1. Faugra supports [imports in the graph schemas](https://github.com/ardatan/graphql-import) so your codebase can embrace [modularization](examples/modularized).
2. Isn't basic CRUD enough? What about more complex custom resolvers? Faugra integrates well with [user-defined functions [UDF]](https://docs.fauna.com/fauna/current/api/graphql/functions), automatically keeping your functions in sync with fauna's backend.

For more examples, please check our [examples directory](https://github.com/zvictor/faugra/tree/master/examples)

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.design/divider.png)

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

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.design/divider.png)

## Usage

```
Usage: faugra [options] [command]

Options:
  -V, --version                                            output the version number
  -s, --secret <value>                                     set Fauna's secret key, used to push/pull schemas to and from the
                                                           database (defaults to <FAUGRA_SECRET>).
  -d, --domain <value>                                     set Fauna's endpoint (defaults to <FAUGRA_DOMAIN or
                                                           'https://graphql.fauna.com'>).
  -i, --ignore <value>                                     set glob patterns to exclude matches (defaults to <FAUGRA_IGNORE
                                                           or '**/node_modules/**,**/.git/**'>).
  --verbose                                                run the command with verbose logging.
  --debug [port]                                           run the command with debugging listening on [port].
  --debug-brk [port]                                       run the command with debugging(-brk) listening on [port].
  -h, --help                                               display help for command

Commands:
  dev [directory]                                          watch for changes and run helpers accordingly. Defaults:
                                                           [directory: <pwd>]
  define-functions [pattern]                               upload your User-Defined Functions (UDF) to faunadb. Defaults:
                                                           [pattern: **/*.udf]
  define-roles [pattern]                                   upload your User-Defined Roles (UDR) to faunadb. Defaults:
                                                           [pattern: **/*.role]
  pull-schema [output]                                     load the schema hosted in faunadb. Defaults: [output: <stdout>]
  push-schema [pattern]                                    push your schema to faunadb. Defaults: [pattern:
                                                           **/*.(graphql|gql)]
  generate-types [pattern] [output]                        code generator that converts graphql schemas into typescript
                                                           types. Defaults: [pattern: **/[A-Z]*.(graphql|gql), output:
                                                           <stdout>]
  build-sdk [schema-pattern] [documents-pattern] [output]  code generator that converts graphql schemas into typescript
                                                           types. Defaults: [schema-pattern: **/[A-Z]*.(graphql|gql),
                                                           documents-pattern: **/[a-z]*.(graphql|gql) output: <stdout>]
  help [command]                                           display help for command
```

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.design/divider.png)

<p align="center">
Logo by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">Pixabay</a>
</p>
