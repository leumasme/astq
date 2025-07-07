declare module "pegjs-util" {
    interface ParseResult {
        ast: any;
        error: any;
    }

    interface ParseOptions {
        startRule?: string;
        makeAST?: (line: number, column: number, offset: number, args: any[]) => any;
    }

    interface PEGUtil {
        parse(parser: any, input: string, options?: ParseOptions): ParseResult;
        errorMessage(error: any, withLocation?: boolean): string;
    }

    const PEGUtil: PEGUtil;
    export = PEGUtil;
}