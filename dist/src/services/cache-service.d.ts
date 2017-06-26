/// <reference types="koa" />
import * as Koa from 'koa';
import { CoreService } from '../core-interface';
export declare class CacheService extends CoreService {
    store: {
        [key: string]: any;
    };
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    flush(): Promise<void>;
    serve(): Koa.Middleware;
}
