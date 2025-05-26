import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        rules: {
            "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
            "@typescript-eslint/consistent-type-definitions": ["off"],
            "@typescript-eslint/prefer-regexp-exec": "off",
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        ignores: ["_dist/", "deploy/", "eslint.config.js"],
    }
)
