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

const pos = (A: ASTQAdapterInterface, T: any, axis: string = "*"): number => {
    const parent = A.getParentNode(T);
    if (parent === null) {
        return 1;
    }
    const pchilds = A.getChildNodes(parent, axis);
    for (let i = 0; i < pchilds.length; i++) {
        if (pchilds[i] === T) {
            return (i + 1);
        }
    }
    throw new Error("cannot find myself");
};

const parents = (A: ASTQAdapterInterface, T: any): any[] => {
    const parentNodes: any[] = [];
    let node = T;
    while ((node = A.getParentNode(node)) !== null) {
        parentNodes.push(node);
    }
    return parentNodes;
};

const stdfuncs: { [name: string]: (...args: any[]) => any } = {
    "type": (A: ASTQAdapterInterface, T: any, axis: string): string => {
        return A.getNodeType(T);
    },

    "attrs": (A: ASTQAdapterInterface, T: any, axis: string, sep?: string): string => {
        if (sep === undefined) {
            sep = " ";
        }
        return sep + A.getNodeAttrNames(T).join(sep) + sep;
    },

    "depth": (A: ASTQAdapterInterface, T: any, axis: string): number => {
        let depth = 1;
        let node = T;
        while ((node = A.getParentNode(node)) !== null) {
            depth++;
        }
        return depth;
    },

    "pos": (A: ASTQAdapterInterface, T: any, axis: string): number => {
        return pos(A, T, axis);
    },

    "nth": (A: ASTQAdapterInterface, T: any, axis: string, num: number | string): boolean => {
        let numValue = parseInt(String(num), 10);
        const parent = A.getParentNode(T);
        if (parent !== null) {
            const pchilds = A.getChildNodes(parent, axis);
            if (numValue < 0) {
                numValue = pchilds.length - (numValue + 1);
            }
            for (let i = 0; i < pchilds.length; i++) {
                if (pchilds[i] === T) {
                    return ((i + 1) === numValue);
                }
            }
            return false;
        } else if (numValue === 1) {
            return true;
        } else {
            return false;
        }
    },

    "first": (A: ASTQAdapterInterface, T: any, axis: string): boolean => {
        return stdfuncs.nth(A, T, axis, 1);
    },

    "last": (A: ASTQAdapterInterface, T: any, axis: string): boolean => {
        return stdfuncs.nth(A, T, axis, -1);
    },

    "count": (A: ASTQAdapterInterface, T: any, axis: string, val: any): number => {
        if (typeof val === "object" && val instanceof Array) {
            return val.length;
        } else if (typeof val === "object") {
            return Object.keys(val).length;
        } else if (typeof val === "string") {
            return val.length;
        } else {
            return String(val).length;
        }
    },

    "below": (A: ASTQAdapterInterface, T: any, axis: string, other: any): boolean => {
        if (!A.taste(other)) {
            throw new Error("invalid argument to function \"below\" (node expected)");
        }
        let node = T;
        while ((node = A.getParentNode(node)) !== null) {
            if (node === other) {
                return true;
            }
        }
        return false;
    },

    "follows": (A: ASTQAdapterInterface, T: any, axis: string, other: any): boolean => {
        if (!A.taste(other)) {
            throw new Error("invalid argument to function \"follows\" (node expected)");
        }
        if (T === other) {
            return false;
        }
        const pathOfT = [T].concat(parents(A, T)).reverse();
        const pathOfOther = [other].concat(parents(A, other)).reverse();
        const len = Math.min(pathOfT.length, pathOfOther.length);
        let i;
        for (i = 0; i < len; i++) {
            if (pathOfT[i] !== pathOfOther[i]) {
                break;
            }
        }
        if (i === 0) {
            throw new Error("internal error: root nodes have to be same same");
        } else if (i === len) {
            if (pathOfOther.length < pathOfT.length) {
                return true;
            } else {
                return false;
            }
        } else {
            return pos(A, pathOfT[i], axis) > pos(A, pathOfOther[i], axis);
        }
    },

    "in": (A: ASTQAdapterInterface, T: any, axis: string, val: any): boolean => {
        if (!(typeof val === "object" && val instanceof Array)) {
            throw new Error("invalid argument to function \"in\" (array expected)");
        }
        for (let i = 0; i < val.length; i++) {
            if (val[i] === T) {
                return true;
            }
        }
        return false;
    },

    "substr": (A: ASTQAdapterInterface, T: any, axis: string, str: any, pos: number, len: number): string => {
        return String(str).substr(pos, len);
    },

    "index": (A: ASTQAdapterInterface, T: any, axis: string, str: any, sub: string, from?: number): number => {
        return String(str).indexOf(sub, from);
    },

    "trim": (A: ASTQAdapterInterface, T: any, axis: string, str: any): string => {
        return String(str).trim();
    },

    "lc": (A: ASTQAdapterInterface, T: any, axis: string, str: any): string => {
        return String(str).toLowerCase();
    },

    "uc": (A: ASTQAdapterInterface, T: any, axis: string, str: any): string => {
        return String(str).toUpperCase();
    }
};

export default stdfuncs;