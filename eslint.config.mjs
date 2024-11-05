import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { pathsToModuleNameMapper } from "ts-jest";
import config from "./tsconfig.json";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    moduleNameMapper: pathsToModuleNameMapper(config.compilerOptions.paths, {
      prefix: "<rootDir>/",
    }),
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
];
