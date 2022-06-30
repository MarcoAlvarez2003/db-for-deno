import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { router } from "./router.ts";

const serverPort = parseInt(Deno.env.get("PORT") ?? "0");
const server = new Application();

server.use(router.routes());
router.use(router.allowedMethods());

server.addEventListener("listen", (e) => {
    console.log(`listening on port ${e.port}`);
});

await server.listen({
    port: serverPort,
});
