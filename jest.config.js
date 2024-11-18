/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    "^.+.tsx?$": ["ts-jest", {
      tsconfig: './tsconfig.test.json'
    }],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov"],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};