// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
    // Node v20.11.0+ এ কাজ করে
    baseDirectory: import.meta.dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals"],
    }),
];

export default eslintConfig;
