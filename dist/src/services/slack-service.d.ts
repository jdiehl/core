import { CoreService } from '../core-interface';
export declare class SlackService extends CoreService {
    post(text: string, attachments: any[]): Promise<void>;
}
