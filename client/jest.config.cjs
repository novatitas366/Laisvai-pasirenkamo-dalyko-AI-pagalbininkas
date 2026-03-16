module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^../../services/api$': '<rootDir>/src/__mocks__/api.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
