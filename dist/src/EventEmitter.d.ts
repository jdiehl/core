export interface IEventSubscription {
    destroy(): void;
    trigger(...args: any[]): IEventSubscription;
}
export declare class EventEmitter<EventType extends string = string> {
    private subscriptions;
    on(event: EventType, listener: (...args: any[]) => void): IEventSubscription;
    emit(event: EventType, ...args: any[]): void;
    destroyAllSubscriptions(): void;
}
