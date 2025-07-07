import * as chai from "chai";
const expect = chai.expect;
chai.config.includeStack = true;

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

describe("ASTq Named Axis Support", function () {
    const astq = new ASTQ();
    astq.adapter(new TestAdapter());

    it("should find first argument using nth(1) on :arguments axis", function () {
        const callExpr = ast.children[0].children[0];
        const result = astq.query(callExpr, `/:arguments * [ nth(1) ]`);
        
        expect(result).to.have.length(1);
        expect(result[0].type).to.equal("Literal");
        expect(result[0].attrs.value).to.equal(1);
    });

    it("should find callee using nth(1) on * axis", function () {
        const callExpr = ast.children[0].children[0];
        const result = astq.query(callExpr, `/ * [ nth(1) ]`);
        
        expect(result).to.have.length(1);
        expect(result[0].type).to.equal("Identifier");
        expect(result[0].attrs.name).to.equal("a");
    });

    it("should give different results for nth(1) on different axes", function () {
        const callExpr = ast.children[0].children[0];
        const resultStar = astq.query(callExpr, `/ * [ nth(1) ]`);
        const resultArgs = astq.query(callExpr, `/:arguments * [ nth(1) ]`);
        
        expect(resultStar).to.have.length(1);
        expect(resultArgs).to.have.length(1);
        expect(resultStar[0].type).to.not.equal(resultArgs[0].type);
        
        // Star axis should find callee (Identifier)
        expect(resultStar[0].type).to.equal("Identifier");
        expect(resultStar[0].attrs.name).to.equal("a");
        
        // Arguments axis should find first argument (Literal)
        expect(resultArgs[0].type).to.equal("Literal");
        expect(resultArgs[0].attrs.value).to.equal(1);
    });
});