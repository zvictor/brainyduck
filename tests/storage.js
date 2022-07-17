const dataStore = {}

const loadStorage = (suiteLevel = false) => {
  const { currentTestName, testPath } = expect.getState()
  const suiteStore = (dataStore[testPath] = dataStore[testPath] || {})
  return !suiteLevel && currentTestName
    ? (suiteStore[currentTestName] = suiteStore[currentTestName] || {})
    : suiteStore
}

export const store = (key, value, suiteLevel) => {
  const localStore = loadStorage(suiteLevel)

  localStore[key] = value
}

export const load = (key, suiteLevel = false) => {
  const localStore = loadStorage(suiteLevel)

  return localStore[key]
}
