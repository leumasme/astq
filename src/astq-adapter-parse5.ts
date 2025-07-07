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

interface Parse5Attr {
    name: string;
    value: string;
}

interface Parse5Node {
    nodeName: string;
    parentNode?: Parse5Node;
    childNodes?: Parse5Node[];
    attrs?: Parse5Attr[];
    value?: string;
}

export default class ASTQAdapterParse5 implements ASTQAdapterInterface {
    static taste(node: any): boolean {
        return (typeof node === "object" &&
                node !== null &&
                !(typeof Node === "object" && node instanceof Node) &&
                typeof node.nodeName === "string" &&
                node.nodeName !== "");
    }

    static getParentNode(node: Parse5Node, type?: string): Parse5Node | undefined {
        return node.parentNode;
    }

    static getChildNodes(node: Parse5Node, type?: string): Parse5Node[] {
        return ((typeof node.childNodes === "object" &&
                 node.childNodes instanceof Array) ?
                node.childNodes : []);
    }

    static getNodeType(node: Parse5Node): string {
        return node.nodeName;
    }

    static getNodeAttrNames(node: Parse5Node): string[] {
        let attrs = ["value"];
        if (typeof node.attrs === "object" && node.attrs instanceof Array) {
            attrs = attrs.concat(node.attrs.map((n) => n.name));
        }
        return attrs;
    }

    static getNodeAttrValue(node: Parse5Node, attr: string): string | undefined {
        let value: string | undefined;
        if (attr === "value") {
            value = node.value;
        } else if (typeof node.attrs === "object" && node.attrs instanceof Array) {
            const values = node.attrs
                .filter((n) => n.name === attr)
                .map((n) => n.value);
            if (values.length === 1) {
                value = values[0];
            }
        }
        return value;
    }
}