import {IEvents} from '../types'

export class EventEmitter implements IEvents {
    events: Map<string, Set<(...args: any[]) => void>> = new Map();

    on(event: string, callback: (...args: any[]) => void): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)?.add(callback);
    }

    off(event: string, callback: (...args: any[]) => void): void {
      if (this.events.has(event)) {
            this.events.get(event)!.delete(callback);
            if (this.events.get(event)?.size === 0) {
                this.events.delete(event);
            }
        }
    }

    emit(event: string, data?: any): void {
      if (this.events.has(event)) {
            this.events.get(event)!.forEach(callback => callback(data));
        }
        if (this.events.has("*")) {
            this.events.get(("*"))!.forEach(callback => callback({ event, data }));
      }
    }

    trigger(event: string, context?: any): (...args: any[]) => void {
        return (incident: object = {}) => {
            this.emit(event, {
                ...(incident || {}),
                ...(context || {})
            });
        };
    }
}