import { resolve } from 'path'
import execa from 'execa'
import { serial as test } from 'ava'

test('generate types for a schema without imports', async (t) => {
  const basePath = resolve(`${__dirname}/../../examples/basic`)
  process.chdir(basePath)
  t.timeout(35000)

  const { stdout, stderr, exitCode } = await execa('node', [
    '../../index.js',
    'generate-types',
    'User.gql',
  ])

  const expectedOutput = `export type Maybe<T> = T | null;
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


/** 'User' input values */
export type UserInput = {
  username: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  /** Find a document from the collection of 'User' by its id. */
  findUserByID?: Maybe<User>;
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID'];
};

export type User = {
   __typename?: 'User';
  /** The document's ID. */
  _id: Scalars['ID'];
  /** The document's timestamp. */
  _ts: Scalars['Long'];
  username: Scalars['String'];
};

`

  t.false(stdout.includes('error'))
  t.is(stdout, expectedOutput)
  t.is(exitCode, 0)
})
