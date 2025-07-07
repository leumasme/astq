#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { default: ASTQ } = require("../dist/astq.cjs");

// Create a custom adapter that supports named axes like the issue describes
class TestAdapter {
    taste(node) {
        return (typeof node === "object" && node !== null && typeof node.type === "string");
    }

    getNodeType(node) {
        return node.type;
    }

    getNodeAttrNames(node) {
        return Object.keys(node.attrs || {});
    }

    getNodeAttrValue(node, attr) {
        return (node.attrs || {})[attr];
    }

    setNodeAttrValue(node, attr, value) {
        if (!node.attrs) node.attrs = {};
        node.attrs[attr] = value;
        return node;
    }

    getChildNodes(node, type) {
        if (type === "*") {
            // Return all children in order: callee first, then arguments
            const children = [];
            if (node.callee) children.push(node.callee);
            if (node.arguments) children.push(...node.arguments);
            return children;
        } else if (type === "arguments") {
            return node.arguments || [];
        } else if (type === "callee") {
            return node.callee ? [node.callee] : [];
        }
        return [];
    }

    getParentNode(node) {
        return node.parent || null;
    }
}

// Create test AST structure that matches the issue
const ast = {
    type: "Program",
    children: [{
        type: "ExpressionStatement",
        parent: null, // Will be set below
        children: [{
            type: "CallExpression",
            parent: null, // Will be set below
            callee: {
                type: "Identifier",
                attrs: { name: "a" },
                parent: null // Will be set below
            },
            arguments: [{
                type: "Literal",
                attrs: { value: 1 },
                parent: null // Will be set below
            }]
        }]
    }]
};

// Set up parent references
ast.children[0].parent = ast;
ast.children[0].children[0].parent = ast.children[0];
ast.children[0].children[0].callee.parent = ast.children[0].children[0];
ast.children[0].children[0].arguments[0].parent = ast.children[0].children[0];

const astq = new ASTQ();
astq.adapter(new TestAdapter());

console.log("Test AST structure:");
console.log("Program");
console.log("  ExpressionStatement");
console.log("    CallExpression");
console.log("      callee: Identifier(a)");
console.log("      arguments: [Literal(1)]");
console.log("");

// Test the original issue: nth(1) on :arguments axis should find the first argument
console.log("Testing nth(1) on :arguments axis...");
try {
    const callExpr = ast.children[0].children[0];
    const result = astq.query(callExpr, `/:arguments * [ nth(1) ]`);
    
    console.log("Query result:", result);
    console.log("Result length:", result.length);
    
    if (result.length === 1 && result[0].attrs.value === 1) {
        console.log("✅ SUCCESS: nth(1) correctly found the 1st argument on :arguments axis");
    } else {
        console.log("❌ FAILED: nth(1) did not find the expected result");
        console.log("Expected: Literal with value 1");
        console.log("Got:", result.map(n => ({ type: n.type, attrs: n.attrs })));
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}

console.log("");

// Test nth(1) on * axis should find the callee (first child on * axis)
console.log("Testing nth(1) on * axis...");
try {
    const callExpr = ast.children[0].children[0];
    const result = astq.query(callExpr, `/ * [ nth(1) ]`);
    
    console.log("Query result:", result);
    console.log("Result length:", result.length);
    
    if (result.length === 1 && result[0].attrs.name === "a") {
        console.log("✅ SUCCESS: nth(1) correctly found the 1st child on * axis (callee)");
    } else {
        console.log("❌ FAILED: nth(1) did not find the expected result on * axis");
        console.log("Expected: Identifier with name 'a'");
        console.log("Got:", result.map(n => ({ type: n.type, attrs: n.attrs })));
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}

console.log("");

// Test that different axes give different results for nth(1)
console.log("Comparing nth(1) results on different axes...");
try {
    const callExpr = ast.children[0].children[0];
    const resultStar = astq.query(callExpr, `/ * [ nth(1) ]`);
    const resultArgs = astq.query(callExpr, `/:arguments * [ nth(1) ]`);
    
    console.log("nth(1) on * axis:", resultStar.map(n => ({ type: n.type, attrs: n.attrs })));
    console.log("nth(1) on :arguments axis:", resultArgs.map(n => ({ type: n.type, attrs: n.attrs })));
    
    if (resultStar.length === 1 && resultArgs.length === 1 && 
        resultStar[0].type !== resultArgs[0].type) {
        console.log("✅ SUCCESS: nth(1) gives different results on different axes");
    } else {
        console.log("❌ FAILED: nth(1) should give different results on different axes");
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}