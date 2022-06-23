import { DataBase, Storage } from "./interfaces.ts";

/**
 * Allows you to manage a temporary database
 */
export class TemporalStorage implements DataBase {
    constructor(protected storage: Storage = {}) {}

    public append(key: string, value: unknown): void {
        this.storage[key] = value;
    }

    public select(key: string): unknown {
        return this.storage[key];
    }

    public remove(key: string): void {
        delete this.storage[key];
    }

    public reset(): void {
        this.storage = {};
    }

    public keys(): string[] {
        return Object.keys(this.storage);
    }
}
