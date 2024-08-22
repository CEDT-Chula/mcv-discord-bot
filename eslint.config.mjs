import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
export default [
  {
    files: ["src/**/*.ts","tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: globals.node
    },
    plugins: {
      "unused-imports": unusedImports,
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": 
      [
        "error",
        {
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    ignores: ["*","!src","!tests"]
  }
]