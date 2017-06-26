import { ICoreConfig, ICoreServices } from './core-interface';
export declare abstract class CoreApp<C extends ICoreConfig, S extends ICoreServices> {
    private config;
    private server;
    private services;
    readonly abstract customServices: any;
    constructor(config: C);
    init(): Promise<void>;
    private addServices(services, add);
    private initServer();
    private initServices();
    private startServer();
}
