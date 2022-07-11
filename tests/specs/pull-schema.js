import path from 'path'
import { execaSync } from 'execa'
import { fileURLToPath } from 'url'
import reset from '../../commands/reset.js'
import { importSchema } from '../../utils.js'
import { setupEnvironment, amountOfCollectionsCreated } from '../testUtils.js'

setupEnvironment(`pull-schema`)

beforeEach(() => reset({ schemas: true, collections: true }), 240000)

test('fails on empty schema', async () => {
  try {
    execaSync('node', ['../../cli.js', 'pull-schema'], {
      env: { DEBUG: 'brainyduck:*' },
      cwd: path.dirname(fileURLToPath(import.meta.url)),
    })

    fail('it should not reach here')
  } catch (error) {
    expect(error.message).toEqual(
      expect.stringContaining('Error: Invalid schema retrieved: missing type Query')
    )
    expect(error.exitCode).toBe(1)
  }
}, 240000)

test('fetch schema from fauna', async () => {
  const schema = `
  type User {
    username: String! @unique
  }`

  // The schema needs to be pre-populated/reset before we can pull it again
  await importSchema(schema, { override: true })

  const { stdout, stderr, exitCode } = execaSync('node', ['../../cli.js', 'pull-schema'], {
    env: { DEBUG: 'brainyduck:*' },
    cwd: path.dirname(fileURLToPath(import.meta.url)),
  })

  const expectedSchema = `schema {
  query: Query
  mutation: Mutation
}

directive @embedded on OBJECT

directive @collection(name: String!) on OBJECT

directive @index(name: String!) on FIELD_DEFINITION

directive @resolver(name: String, paginated: Boolean! = false) on FIELD_DEFINITION

directive @relation(name: String) on FIELD_DEFINITION

directive @unique(index: String) on FIELD_DEFINITION

scalar Date

type Mutation {
  """Create a new document in the collection of 'User'"""
  createUser(
    """'User' input values"""
    data: UserInput!
  ): User!
  """Update an existing document in the collection of 'User'"""
  updateUser(
    """The 'User' document's ID"""
    id: ID!
    """'User' input values"""
    data: UserInput!
  ): User
  """Delete an existing document in the collection of 'User'"""
  deleteUser(
    """The 'User' document's ID"""
    id: ID!
  ): User
  """
  Partially updates an existing document in the collection of 'User'. It only modifies the values that are specified in the arguments. During execution, it verifies that required fields are not set to 'null'.
  """
  partialUpdateUser(
    """The 'User' document's ID"""
    id: ID!
    """'User' input values"""
    data: PartialUpdateUserInput!
  ): User
}

"""'User' input values"""
input PartialUpdateUserInput {
  username: String
}

scalar Time

"""'User' input values"""
input UserInput {
  username: String!
}

type Query {
  """Find a document from the collection of 'User' by its id."""
  findUserByID(
    """The 'User' document's ID"""
    id: ID!
  ): User
}

type User {
  """The document's ID."""
  _id: ID!
  """The document's timestamp."""
  _ts: Long!
  username: String!
}

"""
The \`Long\` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1.
"""
scalar Long`

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(stdout).toEqual(expectedSchema)
  expect(exitCode).toBe(0)

  expect(await amountOfCollectionsCreated()).toBe(1)
}, 240000)
