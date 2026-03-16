/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  collectCoverage: true,
  collectCoverageFrom: [
    'src/modules/upload/upload.service.js',
    'src/modules/upload/upload.controller.js',
    'src/modules/recommendations/recommendations.service.js',
    'src/modules/recommendations/recommendations.controller.js',
  ],
  coverageThreshold: {
    './src/modules/recommendations/recommendations.service.js': {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
    './src/modules/recommendations/recommendations.controller.js': {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
}
