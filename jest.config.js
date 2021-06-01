module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['**/built/cjs/*.js', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/.coverage',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true
};
