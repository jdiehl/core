import { Collection } from 'mongodb';
import { CoreService } from '../core-interface';
export declare class MongoService extends CoreService {
    private db;
    beforeInit(): Promise<void>;
    collection<T>(name: string): Collection<T>;
    close(): Promise<void>;
}
