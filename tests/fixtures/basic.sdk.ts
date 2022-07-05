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
  data: UserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', _id: string, _ts: any, username: string } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'User', _id: string, _ts: any, username: string } | null };

export type PartialUpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PartialUpdateUserInput;
}>;


export type PartialUpdateUserMutation = { __typename?: 'Mutation', partialUpdateUser?: { __typename?: 'User', _id: string, _ts: any, username: string } | null };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', _id: string, _ts: any, username: string } | null };

export type AllUsersQueryVariables = Exact<{
  _size?: InputMaybe<Scalars['Int']>;
  _cursor?: InputMaybe<Scalars['String']>;
}>;


export type AllUsersQuery = { __typename?: 'Query', allUsers: { __typename?: 'UserPage', after?: string | null, before?: string | null, data: Array<{ __typename?: 'User', _id: string, _ts: any, username: string } | null> } };

export type FindUserByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FindUserByIdQuery = { __typename?: 'Query', findUserByID?: { __typename?: 'User', _id: string, _ts: any, username: string } | null };


export const CreateUserDocument = gql`
    mutation createUser($data: UserInput!) {
  createUser(data: $data) {
    _id
    _ts
    username
  }
}
    `;
export const DeleteUserDocument = gql`
    mutation deleteUser($id: ID!) {
  deleteUser(id: $id) {
    _id
    _ts
    username
  }
}
    `;
export const PartialUpdateUserDocument = gql`
    mutation partialUpdateUser($id: ID!, $data: PartialUpdateUserInput!) {
  partialUpdateUser(id: $id, data: $data) {
    _id
    _ts
    username
  }
}
    `;
export const UpdateUserDocument = gql`
    mutation updateUser($id: ID!, $data: UserInput!) {
  updateUser(id: $id, data: $data) {
    _id
    _ts
    username
  }
}
    `;
export const AllUsersDocument = gql`
    query allUsers($_size: Int, $_cursor: String) {
  allUsers(_size: $_size, _cursor: $_cursor) {
    data {
      _id
      _ts
      username
    }
    after
    before
  }
}
    `;
export const FindUserByIdDocument = gql`
    query findUserByID($id: ID!) {
  findUserByID(id: $id) {
    _id
    _ts
    username
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createUser(variables: CreateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserMutation>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUser', 'mutation');
    },
    deleteUser(variables: DeleteUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUser', 'mutation');
    },
    partialUpdateUser(variables: PartialUpdateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PartialUpdateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PartialUpdateUserMutation>(PartialUpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'partialUpdateUser', 'mutation');
    },
    updateUser(variables: UpdateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserMutation>(UpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUser', 'mutation');
    },
    allUsers(variables?: AllUsersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AllUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllUsersQuery>(AllUsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'allUsers', 'query');
    },
    findUserByID(variables: FindUserByIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindUserByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindUserByIdQuery>(FindUserByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'findUserByID', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
export type { Dom };

export default function faugra({
  secret = process?.env.FAUNA_SECRET,
  endpoint = process?.env.FAUNA_ENDPOINT,
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

export { faugra }