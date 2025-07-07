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

import { ASTQAdapterInterface } from "./astq.js";

interface UniSTNode {
    type: string;
    parent?: UniSTNode;
    children?: UniSTNode[];
    data?: any;
    position?: any;
    [key: string]: any;
}

export default class ASTQAdapterUniST implements ASTQAdapterInterface {
    static taste(node: any): boolean {
        return (typeof node === "object" &&
                node !== null &&
                typeof node.type === "string" &&
                node.type !== "");
    }

    static getParentNode(node: UniSTNode, type?: string): UniSTNode {
        if (typeof node.parent === "object" && node.parent !== null) {
            return node.parent;
        } else {
            throw new Error("Your UniST AST does not support parent node traversal");
        }
    }

    static getChildNodes(node: UniSTNode, type?: string): UniSTNode[] {
        return ((typeof node.children === "object" &&
                 node.children instanceof Array) ?
                node.children : []);
    }

    static getNodeType(node: UniSTNode): string {
        return node.type;
    }

    static getNodeAttrNames(node: UniSTNode): string[] {
        const attrs: string[] = [];
        for (const attr in node) {
            if (Object.prototype.hasOwnProperty.call(node, attr) &&
                attr !== "type" &&
                attr !== "data" &&
                attr !== "position" &&
                attr !== "children" &&
                typeof node[attr] !== "object") {
                attrs.push(attr);
            }
        }
        return attrs;
    }

    static getNodeAttrValue(node: UniSTNode, attr: string): any {
        if (Object.prototype.hasOwnProperty.call(node, attr) &&
            attr !== "type" &&
            attr !== "data" &&
            attr !== "position" &&
            attr !== "children" &&
            typeof node[attr] !== "object") {
            return node[attr];
        } else {
            return undefined;
        }
    }
}