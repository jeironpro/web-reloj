// eslint.config.js — Configuración de ESLint (flat config).
//
// Convenciones que fija el proyecto:
// - Calidad y tipos: reglas recomendadas de `@eslint/js` + `typescript-eslint`.
// - Imports: al inicio del archivo, sin duplicados y con `import type` para tipos.
// - Formato (indentación, comillas…): lo deja en manos de Prettier
//   (`eslint-config-prettier` desactiva las reglas que chocarían).

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**", ".freebuff/**", "eslint.config.js"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"],
        plugins: { import: importPlugin },
        rules: {
            // Calidad
            "no-console": "error",
            eqeqeq: ["error", "always"],
            "prefer-const": "error",
            // Tipos
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            // Imports
            "import/first": "error",
            "import/no-duplicates": "error",
        },
    },
    eslintConfigPrettier,
);
