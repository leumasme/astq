import { defineConfig } from "tsup";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

// Read version from VERSION.yml
const versionData = yaml.load(fs.readFileSync("VERSION.yml", "utf8")) as any;
const version = `${versionData.major}.${versionData.minor}.${versionData.micro}`;
const date = versionData.date.toString();

export default defineConfig([
    // ESM build
    {
        entry: ["src/astq.ts"],
        format: ["esm"],
        outDir: "dist",
        dts: true,
        sourcemap: true,
        clean: true,
        onSuccess: async () => {
            // Copy pegjs file to dist
            fs.copyFileSync("src/astq-query-parse.pegjs", "dist/astq-query-parse.pegjs");
        },
        define: {
            "$major": `"${versionData.major}"`,
            "$minor": `"${versionData.minor}"`,
            "$micro": `"${versionData.micro}"`,
            "$date": `"${date}"`
        },
        outExtension() {
            return {
                js: ".js"
            };
        }
    },
    // CommonJS build
    {
        entry: ["src/astq.ts"],
        format: ["cjs"],
        outDir: "dist",
        sourcemap: true,
        define: {
            "$major": `"${versionData.major}"`,
            "$minor": `"${versionData.minor}"`,
            "$micro": `"${versionData.micro}"`,
            "$date": `"${date}"`
        },
        outExtension() {
            return {
                js: ".cjs"
            };
        }
    },
    // Browser build
    {
        entry: ["src/astq.ts"],
        format: ["iife"],
        outDir: "dist",
        globalName: "ASTQ",
        sourcemap: true,
        minify: true,
        define: {
            "$major": `"${versionData.major}"`,
            "$minor": `"${versionData.minor}"`,
            "$micro": `"${versionData.micro}"`,
            "$date": `"${date}"`
        },
        outExtension() {
            return {
                js: ".browser.js"
            };
        }
    }
]);