export default {
  testEnvironment: 'node',
  transform: {},
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/utils/hobbyValidation.js'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { lines: 90, functions: 90, branches: 90 },
  },
}
