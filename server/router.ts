import { Router, Request, Status, Response } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { join } from "https://deno.land/std@0.145.0/path/mod.ts";
import { PersistentStorage } from "../source/mod.ts";

export interface DataBaseAccessor {
    body: PersistentStorage;
    name: string;
    pass: string;
}

export interface DBCreateConfig {
    pass: string;
    name: string;
    key: string;
}

export interface DBDeleteConfig {
    pass: string;
    name: string;
}

export interface DBUpdateConfig {
    name: string;
    pass: string;
    body: Record<string, unknown>;
}

export interface Context {
    response: Response;
    request: Request;
}

export const dbDirname = join(Deno.cwd(), "server", "db");
export const dbStorage: DataBaseAccessor[] = [];
export const router = new Router();

/*
 * Main Functions
 */
export const createDataBase = async ({ request, response }: Context) => {
    const pass = await getPass(request);
    const name = await getName(request);

    dbStorage.push({
        body: await new PersistentStorage(formatDBName(pass, name)).load(),
        name,
        pass,
    });

    response.body = `DB ${name} is created`;
};

export const deleteDataBase = async ({ request, response }: Context) => {
    const pass = await getPass(request);
    const name = await getName(request);

    const index = dbStorage.findIndex((db) => db.name === name && db.pass === pass);
    if (index < 0) return notFound(name, response);

    await dbStorage[index].body.delete();
    dbStorage.splice(index, 1);

    response.body = `DB ${name} is deleted`;
};

export const updateDataBase = async ({ request, response }: Context) => {
    const body = await getBody(request);
    const name = await getName(request);
    const pass = await getPass(request);

    const index = dbStorage.findIndex((db) => db.name === name && db.pass === pass);
    if (index < 0) return notFound(name, response);

    dbStorage[index].body = await new PersistentStorage(formatDBName(pass, name), body).save();

    response.body = `DB ${name} is updated`;
};

export const selectDataBase = async ({ request, response }: Context) => {
    const pass = await getPass(request);
    const name = await getName(request);

    const database = dbStorage.find((db) => db.pass === pass && db.name === name);

    if (database) {
        response.headers.set("content-type", "text/json");
        response.status = Status.OK;
        response.body = PersistentStorage.toJson(database.body);
    } else {
        response.headers.set("content-type", "text/plain");
        response.status = Status.NotFound;
        response.body = `DB ${name} is not found`;
    }
};

export const appendDataBase = async ({ request, response }: Context) => {
    const body = await getBody(request);
    const name = await getName(request);
    const pass = await getPass(request);

    const index = dbStorage.findIndex((db) => db.name === name && db.pass === pass);
    if (index < 0) return notFound(name, response);

    for (const key in body) {
        dbStorage[index].body.append(key, body[key]);
        await dbStorage[index].body.save();
    }

    response.body = `DB ${name} is update content`;
};

/*
 * Util Functions
 */
export const resolveBody = async (request: Request) => ({ body: await request.body().value, type: request.body().type });

export const parsedBody = async (request: Request) =>
    (await resolveBody(request)).type === "json" ? (await resolveBody(request))?.body : {};

export const getPass = async (request: Request) => (await parsedBody(request))?.pass ?? "";

export const getName = async (request: Request) => (await parsedBody(request))?.name ?? "";

export const getBody = async (request: Request) => (await parsedBody(request))?.body ?? "";

/*
 * Errors
 */

export const notFound = (name: string, response: Response) => {
    response.headers.set("content-type", "text/plain");
    response.status = Status.NotFound;
    response.body = `DB ${name} is not found`;
};

/*
 * Init Functions
 */

export const formatDBName = (pass: string, name: string) => join(dbDirname, `[${pass}]-${name}.json`);

export const updateDBDir = async () => {
    try {
        await Deno.mkdir(dbDirname, { recursive: true });
    } catch {
        console.log("creating db dirname");
    }

    await loadDBDir();
};

export const loadDBDir = async () => {
    for await (const entry of Deno.readDir(dbDirname)) {
        const [pass, ...name] = entry.name.split("-");
        const path = join(dbDirname, entry.name);

        dbStorage.push({
            body: await new PersistentStorage(path).load(),
            name: name.join("-").replace(".json", ""),
            pass: pass.replace(/(\[|\])/g, ""),
        });

        console.log(`Loading database ${name.join("-")}`);
    }
};

/*
 * Setting Routes
 */

router.post("/:method", async ({ params: { method }, ..._ }) => {
    console.log("Before", method, "\n", dbStorage);

    if (method === "create") {
        await createDataBase({ ..._ });
    }

    if (method === "delete") {
        await deleteDataBase({ ..._ });
    }

    if (method === "update") {
        await updateDataBase({ ..._ });
    }

    if (method === "select") {
        await selectDataBase({ ..._ });
    }

    if (method === "append") {
        await appendDataBase({ ..._ });
    }

    console.log("after", method, "\n", dbStorage);
});

/*
 * Middleware's
 */
router.use(router.allowedMethods());
await updateDBDir();
