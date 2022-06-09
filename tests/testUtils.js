import faunadb from 'faunadb'
import { faunaClient } from '../utils.js'

const { query: q } = faunadb

export const amountOfFunctionsCreated = () =>
  faunaClient().query(q.Count(q.Functions()))

export const amountOfRolesCreated = () =>
  faunaClient().query(q.Count(q.Roles()))

export const amountOfCollectionsCreated = () =>
  faunaClient().query(q.Count(q.Collections()))
