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

export enum Brainyduck {
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
