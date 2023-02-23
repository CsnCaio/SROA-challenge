module.exports = {
  setupFiles: [
    'dotenv/config'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*'],
};
