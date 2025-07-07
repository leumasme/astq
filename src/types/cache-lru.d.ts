declare module "cache-lru" {
    interface CacheLRU<K = any, V = any> {
        set(key: K, value: V): void;
        get(key: K): V | undefined;
        has(key: K): boolean;
        del(key: K): boolean;
        clear(): void;
        limit(max: number): void;
        size: number;
    }

    interface CacheLRUOptions {
        max?: number;
        maxAge?: number;
    }

    interface CacheLRUConstructor {
        new <K = any, V = any>(options?: CacheLRUOptions): CacheLRU<K, V>;
        <K = any, V = any>(options?: CacheLRUOptions): CacheLRU<K, V>;
    }

    const CacheLRU: CacheLRUConstructor;
    export = CacheLRU;
}