/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setupIntegrationEnv.cjs'],
  transform: {},
  collectCoverage: true,
  collectCoverageFrom: [
    'src/modules/upload/upload.service.js',
    'src/modules/upload/upload.controller.js',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
}
