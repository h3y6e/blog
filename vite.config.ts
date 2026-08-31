import { defineConfig } from "vite-plus";

export default defineConfig({
  defaultPackage: "./site",
  lint: {
    jsPlugins: ["eslint-plugin-baseline-js"],
    plugins: ["eslint", "unicorn", "typescript", "oxc", "import", "promise", "node"],
    categories: {
      suspicious: "error",
      perf: "error",
    },
    rules: {
      "baseline-js/use-baseline": [
        "error",
        {
          available: "newly",
          includeWebApis: { preset: "auto" },
          includeJsBuiltins: { preset: "auto" },
        },
      ],
      "eslint/eqeqeq": ["error", "always", { null: "ignore" }],
      "eslint/no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
      "eslint/no-param-reassign": ["error", { props: true }],
      "eslint/prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
      "import/no-commonjs": "error",
      "import/no-cycle": "error",
      "import/no-dynamic-require": "error",
      "oxc/no-barrel-file": ["error", { threshold: 0 }],
      "oxc/no-const-enum": "error",
      "typescript/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "typescript/consistent-type-definitions": ["error", "type"],
      "typescript/explicit-function-return-type": "error",
      "typescript/method-signature-style": ["error", "property"],
      "typescript/no-explicit-any": "error",
      "typescript/no-floating-promises": "error",
      "typescript/no-import-type-side-effects": "error",
      "typescript/no-require-imports": "error",
      "typescript/no-unnecessary-condition": "error",
      "typescript/no-unnecessary-type-assertion": "error",
      "typescript/no-var-requires": "error",
      "typescript/switch-exhaustiveness-check": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/prefer-node-protocol": "error",
    },
    options: {
      denyWarnings: true,
      reportUnusedDisableDirectives: "error",
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["packages/md/test/golden/", "*.md"],
    sortImports: {
      newlinesBetween: false,
      customGroups: [{ groupName: "workspace", elementNamePattern: ["@blog/**"] }],
      groups: [
        "builtin",
        "external",
        "workspace",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
        "unknown",
      ],
    },
  },
  run: {
    tasks: {
      textlint: "textlint site/posts/*.md",
      lint: {
        command: "vp lint",
        dependsOn: ["textlint"],
      },
      "textlint:fix": {
        command: "textlint --fix site/posts/*.md",
        cache: false,
      },
      "lint:fix": {
        command: "vp lint --fix",
        dependsOn: ["textlint:fix"],
        cache: false,
      },
    },
  },
});
