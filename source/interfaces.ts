/**
 * Defines the common interface of a database
 */
export interface DataBase {
    /**
     * Add a new item to the database
     * @param key Defines the key to store a value
     * @param value Defines the value to be stored
     */
    append(key: string, value: unknown): void;
    /**
     * Get a value from the database
     * @param key Defines the key with which the value is searched in the database
     */
    select(key: string): unknown;
    /**
     * Delete an item from the database
     * @param key Define the key of the element you want to remove
     */
    remove(key: string): void;
    /**
     * Delete all items within the database
     */
    reset(): void;
    /**
     * Get a list with all the keys contained in the database
     */
    keys(): string[];
}

export type Storage = Record<string, unknown>;
