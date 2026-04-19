/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/integration/**/*.test.js'],
  testTimeout: 30000,
}
