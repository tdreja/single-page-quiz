import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  testEnvironment: "node",
  testRegex:  "(/__tests__/.*|(\\.|/)(test|spec))\\.[t]sx?$",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}]
  }
};

export default config;