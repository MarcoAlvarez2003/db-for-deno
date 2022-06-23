import { Storage, DataBase } from "./interfaces.ts";
import { PersistentStorage } from "./persistent.ts";
import { TemporalStorage } from "./temporal.ts";

/**
 * Convert a persistent database to a temporary database
 * @param db Defines the persistent database to convert
 * @returns a temporary database
 */
export function parsePersistentToTemporal(db: PersistentStorage): TemporalStorage {
    const storage = (db as unknown as { storage: Storage }).storage;
    return new TemporalStorage(storage);
}

/**
 * Save a temporary database as a persistent database
 * @param path Define the path to save the database
 * @param db Define the database to save
 */
export async function saveTemporalStorage(path: string, db: TemporalStorage): Promise<void> {
    const storage = (db as unknown as { storage: Storage }).storage;
    await Deno.writeTextFile(path, JSON.stringify(storage));
}

/**
 * Get all the data in the database
 * @param dbs Define the database list
 * @returns a source with the sources of all the databases
 */
export function getAllData(...dbs: DataBase[]): Storage {
    const source: Storage = {};

    for (const db of dbs) {
        for (const key of db.keys()) {
            source[key] = db.select(key);
        }
    }

    return source;
}

/**
 * Return true if the value is a string
 * @param value Defines the value to evaluate
 * @returns true if it is a string
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Return true if the value is a number
 * @param value Defines the value to evaluate
 * @returns true if it is a number
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number";
}

/**
 * Returns true if the value is an array
 * @param value Defines the value to evaluate
 * @returns true if is is an array
 */
export function isArray<Type = unknown>(value: unknown): value is Type[] {
    return value instanceof Array;
}

/**
 * Return true if the value is an object
 * @param value Defines the value to evaluate
 * @returns true if it is an object
 */
export function isObject<Type extends Object>(value: unknown): value is Type {
    return value instanceof Object && !("length" in value);
}
