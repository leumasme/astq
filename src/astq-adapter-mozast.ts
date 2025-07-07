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

interface MozASTNode {
    type: string;
    loc?: any;
    parent?: MozASTNode;
    [key: string]: any;
}

export default class ASTQAdapterMozAST implements ASTQAdapterInterface {
    static taste(node: any): boolean {
        return (typeof node === "object" &&
                node !== null &&
                typeof node.type === "string" &&
                node.type !== "");
    }

    static getParentNode(node: MozASTNode): MozASTNode {
        if (typeof node.parent !== "undefined") {
            return node.parent;
        } else {
            throw new Error("Your Mozilla SpiderMonkey AST does not support parent node traversal");
        }
    }

    static getChildNodes(node: MozASTNode, type?: string): MozASTNode[] {
        const childs: MozASTNode[] = [];
        const checkField = (node: MozASTNode, field: string): void => {
            if (Object.prototype.hasOwnProperty.call(node, field) && this.taste(node[field])) {
                childs.push(node[field]);
            } else if (Object.prototype.hasOwnProperty.call(node, field) &&
                       typeof node[field] === "object" &&
                       node[field] instanceof Array) {
                node[field].forEach((childNode: any) => {
                    if (this.taste(childNode)) {
                        childs.push(childNode);
                    }
                });
            }
        };

        if (type === "*") {
            for (const field in node) {
                checkField(node, field);
            }
        } else if (type !== undefined) {
            if (typeof node[type] !== "undefined") {
                checkField(node, type);
            }
        }
        return childs;
    }

    static getNodeType(node: MozASTNode): string {
        return node.type;
    }

    static getNodeAttrNames(node: MozASTNode): string[] {
        const names: string[] = [];
        for (const field in node) {
            if (Object.prototype.hasOwnProperty.call(node, field) &&
                typeof node[field] !== "object" &&
                field !== "type" &&
                field !== "loc") {
                names.push(field);
            }
        }
        return names;
    }

    static getNodeAttrValue(node: MozASTNode, attr: string): any {
        if (Object.prototype.hasOwnProperty.call(node, attr) &&
            typeof node[attr] !== "object" &&
            attr !== "type" &&
            attr !== "loc") {
            return node[attr];
        } else {
            return undefined;
        }
    }
}