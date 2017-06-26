export declare function clone(obj: any): any;
export declare function each<T = any>(obj: any, cb: (value: T, key: string) => boolean | void): void;
export declare function eachAsync<T = any>(objects: any, cb: (obj: T, key: string) => Promise<void> | void): Promise<void>;
export declare function equals<T = any>(a: T, b: T): boolean;
export declare function removeObject(array: any[], obj: any): boolean;
export declare function setOrRemove(obj: any, key: string, value?: any): void;
export declare function makeIndex<T = any>(data: T[], key?: string): {
    [key: string]: T;
};
