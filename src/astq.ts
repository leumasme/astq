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

import CacheLRU from "cache-lru";

import ASTQAdapter from "./astq-adapter.js";
import ASTQAdapterXMLDOM from "./astq-adapter-xmldom.js";
import ASTQAdapterPARSE5 from "./astq-adapter-parse5.js";
import ASTQAdapterMOZAST from "./astq-adapter-mozast.js";
import ASTQAdapterGRAPHQL from "./astq-adapter-graphql.js";
import ASTQAdapterJSON from "./astq-adapter-json.js";
import ASTQAdapterCHEERIO from "./astq-adapter-cheerio.js";
import ASTQAdapterUNIST from "./astq-adapter-unist.js";
import ASTQAdapterASTY from "./astq-adapter-asty.js";
import ASTQFuncs from "./astq-funcs.js";
import ASTQFuncsSTD from "./astq-funcs-std.js";
import ASTQQuery from "./astq-query.js";
import ASTQVersion from "./astq-version.js";

export interface ASTQVersionInfo {
    major: number;
    minor: number;
    micro: number;
    date: string;
}

export interface ASTQParams {
    [key: string]: any;
}

export interface ASTQAdapterInterface {
    taste(node: any): boolean;
    getParentNode(node: any): any;
    getChildNodes(node: any, type?: string): any[];
    getNodeType(node: any): string;
    getNodeAttrNames(node: any): string[];
    getNodeAttrValue(node: any, attr: string): any;
}

export type ASTQFunction = (...args: any[]) => any;

export default class ASTQ {
    private _adapter: ASTQAdapter;
    private _funcs: ASTQFuncs;
    private _cache: CacheLRU<string, any>;

    constructor() {
        this._adapter = new ASTQAdapter()
            .register(ASTQAdapterXMLDOM, false)
            .register(ASTQAdapterPARSE5, false)
            .register(ASTQAdapterMOZAST, false)
            .register(ASTQAdapterGRAPHQL, false)
            .register(ASTQAdapterJSON, false)
            .register(ASTQAdapterCHEERIO, false)
            .register(ASTQAdapterUNIST, false)
            .register(ASTQAdapterASTY, false);

        this._funcs = new ASTQFuncs();
        for (const name in ASTQFuncsSTD) {
            this.func(name, ASTQFuncsSTD[name]);
        }

        this._cache = new CacheLRU();
    }

    version(): ASTQVersionInfo {
        return ASTQVersion;
    }

    adapter(adapter: string | ASTQAdapterInterface | Array<string | ASTQAdapterInterface>, force = false): this {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error("ASTQ#adapter: invalid number of arguments");
        }
        this._adapter.unregister();
        if (!(typeof adapter === "object" && adapter instanceof Array)) {
            adapter = [adapter];
        }
        if (adapter.length > 1 && force) {
            throw new Error("ASTQ#adapter: you can force just a single adapter to not taste the AST node");
        }
        adapter.forEach((adapterItem) => {
            let resolvedAdapter: ASTQAdapterInterface;
            if (typeof adapterItem === "string") {
                if (adapterItem === "mozast") {
                    resolvedAdapter = ASTQAdapterMOZAST;
                } else if (adapterItem === "graphql") {
                    resolvedAdapter = ASTQAdapterGRAPHQL;
                } else if (adapterItem === "xmldom") {
                    resolvedAdapter = ASTQAdapterXMLDOM;
                } else if (adapterItem === "parse5") {
                    resolvedAdapter = ASTQAdapterPARSE5;
                } else if (adapterItem === "json") {
                    resolvedAdapter = ASTQAdapterJSON;
                } else if (adapterItem === "cheerio") {
                    resolvedAdapter = ASTQAdapterCHEERIO;
                } else if (adapterItem === "unist") {
                    resolvedAdapter = ASTQAdapterUNIST;
                } else if (adapterItem === "asty") {
                    resolvedAdapter = ASTQAdapterASTY;
                } else {
                    throw new Error("ASTQ#adapter: unknown built-in adapter");
                }
            } else {
                resolvedAdapter = adapterItem;
            }
            this._adapter.register(resolvedAdapter, force);
        });
        return this;
    }

    func(name: string, func: ASTQFunction): this {
        if (arguments.length !== 2) {
            throw new Error("ASTQ#func: invalid number of arguments");
        }
        this._funcs.register(name, func);
        return this;
    }

    cache(entries: number): this {
        if (arguments.length !== 1) {
            throw new Error("ASTQ#cache: invalid number of arguments");
        }
        this._cache.limit(entries);
        return this;
    }

    compile(selector: string, trace?: boolean): ASTQQuery {
        if (arguments.length < 1) {
            throw new Error("ASTQ#compile: too less arguments");
        }
        if (arguments.length > 2) {
            throw new Error("ASTQ#compile: too many arguments");
        }
        if (trace === undefined) {
            trace = false;
        }
        let query = this._cache.get(selector);
        if (query === undefined) {
            query = new ASTQQuery();
            query.compile(selector, trace);
            this._cache.set(selector, query);
        }
        return query;
    }

    execute(node: any, query: ASTQQuery, params?: ASTQParams, trace?: boolean): any[] {
        if (arguments.length < 2) {
            throw new Error("ASTQ#execute: too less arguments");
        }
        if (arguments.length > 4) {
            throw new Error("ASTQ#execute: too many arguments");
        }
        if (params === undefined) {
            params = {};
        }
        if (trace === undefined) {
            trace = false;
        }
        const adapter = this._adapter.select(node);
        if (adapter === undefined) {
            throw new Error("ASTQ#execute: no suitable adapter found for node");
        }
        return query.execute(node, adapter, params, this._funcs, trace);
    }

    query(node: any, selector: string, params?: ASTQParams, trace?: boolean): any[] {
        if (arguments.length < 2) {
            throw new Error("ASTQ#query: too less arguments");
        }
        if (arguments.length > 4) {
            throw new Error("ASTQ#query: too many arguments");
        }
        if (params === undefined) {
            params = {};
        }
        if (trace === undefined) {
            trace = false;
        }
        return this.execute(node, this.compile(selector, trace), params, trace);
    }
}

