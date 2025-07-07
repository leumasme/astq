/*
**  ASTq -- Abstract Syntax Tree (AST) Query Engine
**  Copyright (c) 2014-2024 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* global describe: false */
/* global it: false */
/* jshint -W030 */
/* eslint no-unused-expressions: 0 */

import * as chai from "chai";
const expect = chai.expect;
chai.config.includeStack = true;

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { default: ASTQ } = require("./dist/astq.cjs");

describe("ASTq Axis Context", function () {
    const astq = new ASTQ()

    // Custom adapter that supports named axes
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

    // Set up custom adapter
    astq.adapter(new TestAdapter());

    // Create test AST structure
    const callExpr = {
        type: "CallExpression",
        callee: {
            type: "Identifier",
            attrs: { name: "a" },
            parent: null // Will be set below
        },
        arguments: [
            {
                type: "Literal",
                attrs: { value: 1 },
                parent: null // Will be set below
            },
            {
                type: "Literal", 
                attrs: { value: 2 },
                parent: null // Will be set below
            }
        ]
    };

    // Set up parent references
    callExpr.callee.parent = callExpr;
    callExpr.arguments[0].parent = callExpr;
    callExpr.arguments[1].parent = callExpr;

    it("nth function respects axis context", function () {
        // nth(1) on * axis should find callee (first child in document order)
        expect(astq.query(callExpr, "/ * [ nth(1) ]"))
            .to.have.lengthOf(1);
        expect(astq.query(callExpr, "/ * [ nth(1) ]")[0].type)
            .to.equal("Identifier");
        expect(astq.query(callExpr, "/ * [ nth(1) ]")[0].attrs.name)
            .to.equal("a");

        // nth(1) on :arguments axis should find first argument
        expect(astq.query(callExpr, "/:arguments * [ nth(1) ]"))
            .to.have.lengthOf(1);
        expect(astq.query(callExpr, "/:arguments * [ nth(1) ]")[0].type)
            .to.equal("Literal");
        expect(astq.query(callExpr, "/:arguments * [ nth(1) ]")[0].attrs.value)
            .to.equal(1);

        // nth(2) on :arguments axis should find second argument
        expect(astq.query(callExpr, "/:arguments * [ nth(2) ]"))
            .to.have.lengthOf(1);
        expect(astq.query(callExpr, "/:arguments * [ nth(2) ]")[0].type)
            .to.equal("Literal");
        expect(astq.query(callExpr, "/:arguments * [ nth(2) ]")[0].attrs.value)
            .to.equal(2);
    });

    it("pos function respects axis context", function () {
        // pos() on * axis
        const starResults = astq.query(callExpr, "/ * [ pos() == 1 ]");
        expect(starResults).to.have.lengthOf(1);
        expect(starResults[0].type).to.equal("Identifier");

        // pos() on :arguments axis
        const argsResults = astq.query(callExpr, "/:arguments * [ pos() == 1 ]");
        expect(argsResults).to.have.lengthOf(1);
        expect(argsResults[0].type).to.equal("Literal");
        expect(argsResults[0].attrs.value).to.equal(1);
    });

    it("first and last functions respect axis context", function () {
        // first() on :arguments axis should find first argument
        expect(astq.query(callExpr, "/:arguments * [ first() ]"))
            .to.have.lengthOf(1);
        expect(astq.query(callExpr, "/:arguments * [ first() ]")[0].attrs.value)
            .to.equal(1);

        // last() on :arguments axis should find last argument
        expect(astq.query(callExpr, "/:arguments * [ last() ]"))
            .to.have.lengthOf(1);
        expect(astq.query(callExpr, "/:arguments * [ last() ]")[0].attrs.value)
            .to.equal(2);
    });
});