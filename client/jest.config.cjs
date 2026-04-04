/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^../../services/api$': '<rootDir>/src/__mocks__/api.cjs',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: ['src/utils/hobbyValidation.js'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { lines: 90, functions: 90, branches: 90, statements: 90 },
  },
}
