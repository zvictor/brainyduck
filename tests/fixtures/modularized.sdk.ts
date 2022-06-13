import { GraphQLClient } from 'graphql-request';
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
  /** The `Long` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export enum Faugra {
  Resetting = 'RESETTING'
}

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


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } };

export type CreateUserMutationVariables = Exact<{
  data: UserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', _id: string, _ts: any, name: string } };

export type DeletePostMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeletePostMutation = { __typename?: 'Mutation', deletePost?: { __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'User', _id: string, _ts: any, name: string } | null };

export type PartialUpdatePostMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PartialUpdatePostInput;
}>;


export type PartialUpdatePostMutation = { __typename?: 'Mutation', partialUpdatePost?: { __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } | null };

export type PartialUpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PartialUpdateUserInput;
}>;


export type PartialUpdateUserMutation = { __typename?: 'Mutation', partialUpdateUser?: { __typename?: 'User', _id: string, _ts: any, name: string } | null };

export type UpdatePostMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PostInput;
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost?: { __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } | null };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', _id: string, _ts: any, name: string } | null };

export type AllPostsQueryVariables = Exact<{
  _size?: InputMaybe<Scalars['Int']>;
  _cursor?: InputMaybe<Scalars['String']>;
}>;


export type AllPostsQuery = { __typename?: 'Query', allPosts: { __typename?: 'PostPage', after?: string | null, before?: string | null, data: Array<{ __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } | null> } };

export type FindPostByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FindPostByIdQuery = { __typename?: 'Query', findPostByID?: { __typename?: 'Post', _id: string, content: string, title: string, _ts: any, author: { __typename?: 'User', _id: string, _ts: any, name: string } } | null };

export type FindUserByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FindUserByIdQuery = { __typename?: 'Query', findUserByID?: { __typename?: 'User', _id: string, _ts: any, name: string } | null };

export type SayHelloQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type SayHelloQuery = { __typename?: 'Query', sayHello: string };


export const CreatePostDocument = gql`
    mutation createPost($data: PostInput!) {
  createPost(data: $data) {
    author {
      _id
      _ts
      name
    }
    _id
    content
    title
    _ts
  }
}
    `;
export const CreateUserDocument = gql`
    mutation createUser($data: UserInput!) {
  createUser(data: $data) {
    _id
    _ts
    name
  }
}
    `;
export const DeletePostDocument = gql`
    mutation deletePost($id: ID!) {
  deletePost(id: $id) {
    author {
      _id
      _ts
      name
    }
    _id
    content
    title
    _ts
  }
}
    `;
export const DeleteUserDocument = gql`
    mutation deleteUser($id: ID!) {
  deleteUser(id: $id) {
    _id
    _ts
    name
  }
}
    `;
export const PartialUpdatePostDocument = gql`
    mutation partialUpdatePost($id: ID!, $data: PartialUpdatePostInput!) {
  partialUpdatePost(id: $id, data: $data) {
    author {
      _id
      _ts
      name
    }
    _id
    content
    title
    _ts
  }
}
    `;
export const PartialUpdateUserDocument = gql`
    mutation partialUpdateUser($id: ID!, $data: PartialUpdateUserInput!) {
  partialUpdateUser(id: $id, data: $data) {
    _id
    _ts
    name
  }
}
    `;
export const UpdatePostDocument = gql`
    mutation updatePost($id: ID!, $data: PostInput!) {
  updatePost(id: $id, data: $data) {
    author {
      _id
      _ts
      name
    }
    _id
    content
    title
    _ts
  }
}
    `;
export const UpdateUserDocument = gql`
    mutation updateUser($id: ID!, $data: UserInput!) {
  updateUser(id: $id, data: $data) {
    _id
    _ts
    name
  }
}
    `;
export const AllPostsDocument = gql`
    query allPosts($_size: Int, $_cursor: String) {
  allPosts(_size: $_size, _cursor: $_cursor) {
    data {
      author {
        _id
        _ts
        name
      }
      _id
      content
      title
      _ts
    }
    after
    before
  }
}
    `;
export const FindPostByIdDocument = gql`
    query findPostByID($id: ID!) {
  findPostByID(id: $id) {
    author {
      _id
      _ts
      name
    }
    _id
    content
    title
    _ts
  }
}
    `;
export const FindUserByIdDocument = gql`
    query findUserByID($id: ID!) {
  findUserByID(id: $id) {
    _id
    _ts
    name
  }
}
    `;
export const SayHelloDocument = gql`
    query sayHello($name: String!) {
  sayHello(name: $name)
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createPost(variables: CreatePostMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreatePostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreatePostMutation>(CreatePostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createPost', 'mutation');
    },
    createUser(variables: CreateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserMutation>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUser', 'mutation');
    },
    deletePost(variables: DeletePostMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeletePostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeletePostMutation>(DeletePostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deletePost', 'mutation');
    },
    deleteUser(variables: DeleteUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUser', 'mutation');
    },
    partialUpdatePost(variables: PartialUpdatePostMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PartialUpdatePostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PartialUpdatePostMutation>(PartialUpdatePostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'partialUpdatePost', 'mutation');
    },
    partialUpdateUser(variables: PartialUpdateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PartialUpdateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PartialUpdateUserMutation>(PartialUpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'partialUpdateUser', 'mutation');
    },
    updatePost(variables: UpdatePostMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdatePostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePostMutation>(UpdatePostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updatePost', 'mutation');
    },
    updateUser(variables: UpdateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserMutation>(UpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUser', 'mutation');
    },
    allPosts(variables?: AllPostsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AllPostsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPostsQuery>(AllPostsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'allPosts', 'query');
    },
    findPostByID(variables: FindPostByIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPostByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPostByIdQuery>(FindPostByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'findPostByID', 'query');
    },
    findUserByID(variables: FindUserByIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindUserByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindUserByIdQuery>(FindUserByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'findUserByID', 'query');
    },
    sayHello(variables: SayHelloQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SayHelloQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SayHelloQuery>(SayHelloDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sayHello', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
export type { Dom };

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
        authorization: secret && `Bearer ${secret}`,
      },
    })
  )
}