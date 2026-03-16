/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/modules/upload/upload.service.js',
    'src/modules/upload/upload.controller.js',
    'src/modules/conversations/**/*.js',
    '!src/modules/conversations/conversations.routes.js'
  ],
  coverageThreshold: {
    global: {
      lines: 20,
      branches: 60,
      functions: 20,
      statements: 20,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
};
