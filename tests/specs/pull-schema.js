import execa from 'execa'
import { importSchema } from '../../utils'
import reset from '../../commands/reset'

beforeEach(() => reset({ schemas: true }), 120000)

test('fetch schema from fauna', async () => {
  const schema = `
  type User {
    username: String! @unique
  }`

  // The schema needs to be pre-populated/reset before we can pull it again
  await importSchema(schema, true)

  const { stdout, stderr, exitCode } = execa.sync('node', ['../../cli.js', 'pull-schema'], {
    env: { DEBUG: 'faugra:*' },
    cwd: __dirname,
  })

  const expectedSchema = `scalar Date

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

"""The \`Long\` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1."""
scalar Long

schema {
  query: Query
  mutation: Mutation
}
`

  expect(stderr).toEqual(expect.not.stringMatching(/error/i))
  expect(stdout).toEqual(expect.not.stringMatching(/error/i))

  expect(stdout).toEqual(expectedSchema)
  expect(exitCode).toBe(0)
}, 120000)
