import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "@/shared/ui", message: "Barrel file removido. Importe o arquivo direto (ex: @/shared/ui/button.ui)" },
          { name: "@/shared/widgets", message: "Barrel file removido. Importe o arquivo direto (ex: @/shared/widgets/book-card.widget)" },
        ],
      }],
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);

export default eslintConfig;
