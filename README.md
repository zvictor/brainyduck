<p align="center"><img src="https://raw.githubusercontent.com/zvictor/faugra/master/.design/logo.jpg" alt="faugra's logo" /><p>
<br>

<p align="center">
<strong>A micro backend framework/builder</strong><br />
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

Given a schema looking anything like this:

<details>
  <summary>schema</summary>

```graphql
type User {
  username: String! @unique
}

type Post {
  content: String!
  author: User!
}
```

</details>

Faugra will give you:

1. A [full-featured data backend](https://docs.fauna.com/fauna/current/introduction)
2. Your original schema will be expanded to provide basic CRUD (no need to worry about their resolvers!). Expect it to look like this:

   <details>
      <summary>expanded schema</summary>

   ```graphql
   type Query {
     findPostByID(id: ID!): Post
     findUserByID(id: ID!): User
     allPosts(_size: Int, _cursor: String): PostPage!
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

   # ... plus few other less important types defining relations and pagination
   ```

   </details>

3. Do you like TypeScript? TS types are auto generated for you.

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
     /** The document's timestamp. */
   }

   export type User = {
     __typename?: 'User'
     /** The document's ID. */
     _id: Scalars['ID']
     /** The document's timestamp. */
     username: Scalars['String']
   }

   // ... plus few other less important types defining relations and pagination
   ```

   </details>

4. Isn't basic CRUD enough? What about custom resolvers? Faugra integrates well with [user-defined functions [UDF]](https://docs.fauna.com/fauna/current/api/graphql/functions), automatically keeping your functions in sync with fauna's backend.

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
  -V, --version                      output the version number
  -s, --secret <value>               set Fauna's secret key, used to push/pull schemas to and from the database (defaults to <FAUGRA_SECRET>).
  -d, --domain <value>               set Fauna's endpoint (defaults to <FAUGRA_DOMAIN or 'https://graphql.fauna.com'>).
  -h, --help                         display help for command

Commands:
  dev [directory]                    watch for changes and run helpers accordingly. Defaults: [directory: <pwd>]
  define-functions [pattern]         upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.fql]
  pull-schema [output]               load the schema hosted in faunadb. Defaults: [output: <stdout>]
  push-schema [pattern]              push your schema to faunadb. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules]
  generate-types [pattern] [output]  code generator that converts graphql schemas into typescript types. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules, output: <stdout>]
  help [command]                     display help for command
```

![divider](https://raw.githubusercontent.com/zvictor/faugra/master/.design/divider.png)

<p align="center">
Logo by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">Pixabay</a>
</p>
