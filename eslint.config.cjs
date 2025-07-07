module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "@typescript-eslint/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
    },
    env: {
        node: true,
        es6: true
    },
    rules: {
        // TypeScript specific rules
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        
        // Code style rules
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "curly": ["error", "all"],
        "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
        "space-before-function-paren": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "array-bracket-spacing": ["error", "never"],
        "comma-dangle": ["error", "never"],
        "no-trailing-spaces": "error",
        "eol-last": "error",
        
        // Best practices
        "no-console": "warn",
        "no-debugger": "error",
        "no-unused-vars": "off", // Use TypeScript version instead
        "prefer-const": "error",
        "no-var": "error"
    }
};