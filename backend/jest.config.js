module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**'],
  setupFilesAfterFramework: ['./src/tests/setup.js']
};
