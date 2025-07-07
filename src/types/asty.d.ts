declare module "asty" {
    interface ASTYNode {
        type(): string;
        parent(): ASTYNode | null;
        childs(): ASTYNode[];
        dump(): string;
        pos(line: number, column: number, offset: number): ASTYNode;
    }

    interface ASTY {
        create(...args: any[]): ASTYNode;
    }

    interface ASTYConstructor {
        new (): ASTY;
    }

    const ASTY: ASTYConstructor;
    export = ASTY;
}