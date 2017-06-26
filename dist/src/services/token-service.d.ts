/// <reference types="koa" />
import { Middleware } from 'koa';
import { CoreService } from '../core-interface';
export declare class TokenService extends CoreService {
    require(domain: string | string[]): Middleware;
}
