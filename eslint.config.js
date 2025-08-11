import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist",
      "build",
      "node_modules",
      "*.config.js",
      "*.config.ts",
      ".eslintrc.cjs",
      "coverage",
      "storybook-static",
      "supabase/migrations"
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react": react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          caughtErrors: "none"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": "off",
      "prefer-const": "error",
      "no-var": "error",
      "no-duplicate-imports": "warn",
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Node scripts overrides
  {
    files: ["*.js", "scripts/**/*.js", "*.cjs", "*.mjs"],
    languageOptions: {
      globals: { ...globals.node }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    }
  },
  // Supabase functions (Deno) overrides
  {
    files: ["supabase/functions/**/*.ts", "supabase/functions/**/*.tsx"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "no-console": "warn",
    }
  },
  {
    files: ["**/*.stories.@(js|jsx|ts|tsx)"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["**/*.test.@(js|jsx|ts|tsx)", "**/*.spec.@(js|jsx|ts|tsx)"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
