import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },

  moduleFileExtensions: ["ts", "tsx", "js"],

  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
};

export default config;
