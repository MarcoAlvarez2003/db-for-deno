import { TemporalStorage } from "./temporal.ts";
import { Storage } from "./interfaces.ts";

/**
 * Allows you to manage a persistent database
 * @extends TemporalStorage
 */
export class PersistentStorage extends TemporalStorage {
    constructor(protected path: string, storage?: Storage) {
        super(storage);
    }

    /**
     * Delete the database
     * @returns Return the database ready to use in a new file
     */
    public async delete(): Promise<PersistentStorage> {
        await Deno.remove(this.path, {
            recursive: true,
        });

        return this;
    }

    /**
     * Load the database into memory
     * @returns Return the database ready to use
     */
    public async load(): Promise<PersistentStorage> {
        try {
            this.storage = JSON.parse(await Deno.readTextFile(this.path)) as Storage;
        } catch {
            await this.save();
        }

        return this;
    }

    /**
     * Save the database for later use
     * @returns Return the database already saved
     */
    public async save(): Promise<PersistentStorage> {
        await Deno.writeTextFile(this.path, JSON.stringify(this.storage));

        return this;
    }

    /**
     * Change the database file
     * @param path Defines the path of the new database file
     */
    public setPath(path: string) {
        this.path = path;
    }

    /**
     * Get the path of the database file
     */
    public getPath() {
        return this.path;
    }
}
