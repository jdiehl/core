/// <reference types="koa" />
/// <reference types="koa-bodyparser" />
/// <reference types="koa-router" />
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { CacheService, MongoService, SlackService, TokenService } from './services';
export interface ICoreConfig {
    database?: string;
    port: number;
    prefix?: string;
    tokens?: {
        [domain: string]: string;
    };
    slackWebhook?: string;
}
export interface ICoreContext extends Koa.Context {
}
export interface ICoreServices {
    cache: CacheService;
    mongo: MongoService;
    slack: SlackService;
    token: TokenService;
}
export declare class CoreService<C extends ICoreConfig = ICoreConfig, S extends ICoreServices = ICoreServices> {
    protected config: C;
    protected services: S;
    constructor(config: C, services: S);
    beforeInit(): Promise<void>;
    init(): Promise<void>;
    install(server: Koa): Router | void;
}
