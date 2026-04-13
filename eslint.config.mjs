// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals"],
    }),
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "next_module/**", // if you have this folder
        ],
    },
    {
        rules: {
            "no-unused-vars": [
                "warn", // or "error" if you want it strict
                {
                    argsIgnorePattern: "^_", // Ignore variables starting with underscore (_)
                    varsIgnorePattern: "^_", // Ignore variables starting with underscore
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
];

export default eslintConfig;
