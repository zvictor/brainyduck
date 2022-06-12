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


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', _id: string } };

export type FindPostByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FindPostByIdQuery = { __typename?: 'Query', findPostByID?: { __typename?: 'Post', title: string, content: string, author: { __typename?: 'User', name: string } } | null };


export const CreatePostDocument = gql`
    mutation createPost($data: PostInput!) {
  createPost(data: $data) {
    _id
  }
}
    `;
export const FindPostByIdDocument = gql`
    query findPostByID($id: ID!) {
  findPostByID(id: $id) {
    title
    content
    author {
      name
    }
  }
}
    `;

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
export { Dom };

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