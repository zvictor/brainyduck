import fs from 'fs/promises'
import path from 'path'
import execa from 'execa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset'
import { locateCache } from '../../utils'
import { setupEnvironment, amountOfCollectionsCreated, listFiles } from '../testUtils.js'

const DEFAULT_CACHE = path.resolve(fileURLToPath(new URL(`../../.cache`, import.meta.url)))
setupEnvironment(`build-sdk`)

beforeEach(
  () =>
    Promise.all([
      fs.rm(DEFAULT_CACHE, { recursive: true, force: true }),
      reset({ schemas: true, collections: true }),
    ]),
  240000
)

test('build an sdk for a schema without imports', async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/basic`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync(
    'node',
    ['../../cli.js', 'build-sdk', 'Schema.graphql'],
    { env: { DEBUG: 'faugra:*' }, cwd }
  )

  const expectedOutput = `import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Time: any;
  /** The \`Long\` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new document in the collection of 'User' */
  createUser: User;
  /** Update an existing document in the collection of 'User' */
  updateUser?: Maybe<User>;
  /** Delete an existing document in the collection of 'User' */
  deleteUser?: Maybe<User>;
  /** Partially updates an existing document in the collection of 'User'. It only modifies the values that are specified in the arguments. During execution, it verifies that required fields are not set to 'null'. */
  partialUpdateUser?: Maybe<User>;
};


export type MutationCreateUserArgs = {
  data: UserInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'];
  data: UserInput;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationPartialUpdateUserArgs = {
  id: Scalars['ID'];
  data: PartialUpdateUserInput;
};

/** 'User' input values */
export type PartialUpdateUserInput = {
  username?: InputMaybe<Scalars['String']>;
};

/** 'User' input values */
export type UserInput = {
  username: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** Find a document from the collection of 'User' by its id. */
  findUserByID?: Maybe<User>;
  allUsers: UserPage;
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID'];
};


export type QueryAllUsersArgs = {
  _size?: InputMaybe<Scalars['Int']>;
  _cursor?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  /** The document's ID. */
  _id: Scalars['ID'];
  /** The document's timestamp. */
  _ts: Scalars['Long'];
  username: Scalars['String'];
};

/** The pagination object for elements of type 'User'. */
export type UserPage = {
  __typename?: 'UserPage';
  /** The elements of type 'User' in this page. */
  data: Array<Maybe<User>>;
  /** A cursor for elements coming after the current page. */
  after?: Maybe<Scalars['String']>;
  /** A cursor for elements coming before the current page. */
  before?: Maybe<Scalars['String']>;
};

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', _id: string } };

export type AllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllUsersQuery = { __typename?: 'Query', allUsers: { __typename?: 'UserPage', data: Array<{ __typename?: 'User', username: string } | null> } };


export const CreateUserDocument = gql\`
    mutation createUser($username: String!) {
  createUser(data: {username: $username}) {
    _id
  }
}
    \`;
export const AllUsersDocument = gql\`
    query allUsers {
  allUsers {
    data {
      username
    }
  }
}
    \`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createUser(variables: CreateUserMutationVariables, requestHeaders?: Dom.RequestInit[\"headers\"]): Promise<CreateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserMutation>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUser', 'mutation');
    },
    allUsers(variables?: AllUsersQueryVariables, requestHeaders?: Dom.RequestInit[\"headers\"]): Promise<AllUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllUsersQuery>(AllUsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'allUsers', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;

export default function faugra({
  secret = process?.env.FAUGRA_SECRET,
  endpoint = process?.env.FAUGRA_ENDPOINT,
} = {}) {
  if (!secret) {
    throw new Error('SDK requires a secret to be defined.')
  }

  return getSdk(
    new GraphQLClient(endpoint || 'https://graphql.fauna.com/graphql', {
      headers: {
        authorization: secret && \`Bearer \${secret}\`,
      },
    })
  )
}`

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(
    stdout
      .split('\n')
      .filter(
        (x) =>
          ![
            `Wiped data still found in fauna's cache.`,
            `Cooling down for 30s...`,
            `Retrying now...`,
          ].includes(x)
      )
      .join('\n')
  ).toEqual(expectedOutput)
  expect(exitCode).toBe(0)

  expect(listFiles(DEFAULT_CACHE)).toEqual([].sort())
  expect(listFiles(locateCache())).toEqual(
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.js', 'sdk.js.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(await amountOfCollectionsCreated()).toBe(1)
}, 240000)

test(`build an sdk for the 'modularized' example, with standard cache`, async () => {
  const cwd = resolve(fileURLToPath(new URL(`../../examples/modularized`, import.meta.url)))

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'build-sdk'], {
    env: { DEBUG: 'faugra:*', FAUGRA_CACHE: undefined },
    cwd,
  })

  const expectedOutput = `import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Time: any;
  /** The \`Long\` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Update an existing document in the collection of 'User' */
  updateUser?: Maybe<User>;
  /** Create a new document in the collection of 'User' */
  createUser: User;
  /** Partially updates an existing document in the collection of 'Post'. It only modifies the values that are specified in the arguments. During execution, it verifies that required fields are not set to 'null'. */
  partialUpdatePost?: Maybe<Post>;
  /** Update an existing document in the collection of 'Post' */
  updatePost?: Maybe<Post>;
  /** Delete an existing document in the collection of 'User' */
  deleteUser?: Maybe<User>;
  /** Delete an existing document in the collection of 'Post' */
  deletePost?: Maybe<Post>;
  /** Partially updates an existing document in the collection of 'User'. It only modifies the values that are specified in the arguments. During execution, it verifies that required fields are not set to 'null'. */
  partialUpdateUser?: Maybe<User>;
  /** Create a new document in the collection of 'Post' */
  createPost: Post;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'];
  data: UserInput;
};


export type MutationCreateUserArgs = {
  data: UserInput;
};


export type MutationPartialUpdatePostArgs = {
  id: Scalars['ID'];
  data: PartialUpdatePostInput;
};


export type MutationUpdatePostArgs = {
  id: Scalars['ID'];
  data: PostInput;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePostArgs = {
  id: Scalars['ID'];
};


export type MutationPartialUpdateUserArgs = {
  id: Scalars['ID'];
  data: PartialUpdateUserInput;
};


export type MutationCreatePostArgs = {
  data: PostInput;
};

/** 'Post' input values */
export type PartialUpdatePostInput = {
  title?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<Scalars['String']>;
  author?: InputMaybe<PostAuthorRelation>;
};

/** 'User' input values */
export type PartialUpdateUserInput = {
  name?: InputMaybe<Scalars['String']>;
};

/** Allow manipulating the relationship between the types 'Post' and 'User' using the field 'Post.author'. */
export type PostAuthorRelation = {
  /** Create a document of type 'User' and associate it with the current document. */
  create?: InputMaybe<UserInput>;
  /** Connect a document of type 'User' with the current document using its ID. */
  connect?: InputMaybe<Scalars['ID']>;
};

/** 'Post' input values */
export type PostInput = {
  title: Scalars['String'];
  content: Scalars['String'];
  author?: InputMaybe<PostAuthorRelation>;
};

/** 'User' input values */
export type UserInput = {
  name: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  author: User;
  /** The document's ID. */
  _id: Scalars['ID'];
  content: Scalars['String'];
  title: Scalars['String'];
  /** The document's timestamp. */
  _ts: Scalars['Long'];
};

/** The pagination object for elements of type 'Post'. */
export type PostPage = {
  __typename?: 'PostPage';
  /** The elements of type 'Post' in this page. */
  data: Array<Maybe<Post>>;
  /** A cursor for elements coming after the current page. */
  after?: Maybe<Scalars['String']>;
  /** A cursor for elements coming before the current page. */
  before?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Find a document from the collection of 'User' by its id. */
  findUserByID?: Maybe<User>;
  /** Find a document from the collection of 'Post' by its id. */
  findPostByID?: Maybe<Post>;
  allPosts: PostPage;
  sayHello: Scalars['String'];
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID'];
};


export type QueryFindPostByIdArgs = {
  id: Scalars['ID'];
};


export type QueryAllPostsArgs = {
  _size?: InputMaybe<Scalars['Int']>;
  _cursor?: InputMaybe<Scalars['String']>;
};


export type QuerySayHelloArgs = {
  name: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  /** The document's ID. */
  _id: Scalars['ID'];
  /** The document's timestamp. */
  _ts: Scalars['Long'];
  name: Scalars['String'];
};

export type CreatePostMutationVariables = Exact<{
  data: PostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', _id: string } };

export type FindPostByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FindPostByIdQuery = { __typename?: 'Query', findPostByID?: { __typename?: 'Post', title: string, content: string, author: { __typename?: 'User', name: string } } | null };


export const CreatePostDocument = gql\`
    mutation createPost($data: PostInput!) {
  createPost(data: $data) {
    _id
  }
}
    \`;
export const FindPostByIdDocument = gql\`
    query findPostByID($id: ID!) {
  findPostByID(id: $id) {
    title
    content
    author {
      name
    }
  }
}
    \`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createPost(variables: CreatePostMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreatePostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreatePostMutation>(CreatePostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createPost', 'mutation');
    },
    findPostByID(variables: FindPostByIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPostByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPostByIdQuery>(FindPostByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'findPostByID', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;

export default function faugra({
  secret = process?.env.FAUGRA_SECRET,
  endpoint = process?.env.FAUGRA_ENDPOINT,
} = {}) {
  if (!secret) {
    throw new Error('SDK requires a secret to be defined.')
  }

  return getSdk(
    new GraphQLClient(endpoint || 'https://graphql.fauna.com/graphql', {
      headers: {
        authorization: secret && \`Bearer \${secret}\`,
      },
    })
  )
}`

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(
    expect.not.stringMatching(/error(?!\('SDK requires a secret to be defined.'\))/i)
  )

  expect(
    stdout
      .split('\n')
      .filter(
        (x) =>
          ![
            `Wiped data still found in fauna's cache.`,
            `Cooling down for 30s...`,
            `Retrying now...`,
          ].includes(x)
      )
      .join('\n')
  ).toEqual(expectedOutput)
  expect(exitCode).toBe(0)

  expect(listFiles(DEFAULT_CACHE)).toEqual(
    ['sdk.d.ts', 'sdk.d.ts.map', 'sdk.js', 'sdk.js.map', 'sdk.ts', 'tsconfig.json'].sort()
  )

  expect(await amountOfCollectionsCreated()).toBe(2)
}, 240000)
