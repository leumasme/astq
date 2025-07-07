declare class ASTQFuncs {
    private _funcs;
    constructor();
    register(name: string, func: ASTQFunction): void;
    run(name: string, args: any[]): any;
}

declare class ASTQQuery {
    private asty;
    private ast;
    constructor(selector?: string);
    compile(selector: string, trace?: boolean): this;
    dump(): string;
    execute(node: any, adapter: ASTQAdapterInterface, params: ASTQParams, funcs: ASTQFuncs, trace?: boolean): any[];
}

interface ASTQVersionInfo {
    major: number;
    minor: number;
    micro: number;
    date: string;
}
interface ASTQParams {
    [key: string]: any;
}
interface ASTQAdapterInterface {
    taste(node: any): boolean;
    getParentNode(node: any, type?: string): any;
    getChildNodes(node: any, type?: string): any[];
    getNodeType(node: any): string;
    getNodeAttrNames(node: any): string[];
    getNodeAttrValue(node: any, attr: string): any;
}
type ASTQFunction = (...args: any[]) => any;
declare class ASTQ {
    private _adapter;
    private _funcs;
    private _cache;
    constructor();
    version(): ASTQVersionInfo;
    adapter(adapter: string | ASTQAdapterInterface | Array<string | ASTQAdapterInterface>, force?: boolean): this;
    func(name: string, func: ASTQFunction): this;
    cache(entries: number): this;
    compile(selector: string, trace?: boolean): ASTQQuery;
    execute(node: any, query: ASTQQuery, params?: ASTQParams, trace?: boolean): any[];
    query(node: any, selector: string, params?: ASTQParams, trace?: boolean): any[];
}

export { type ASTQAdapterInterface, type ASTQFunction, type ASTQParams, type ASTQVersionInfo, ASTQ as default };
