import fs from "fs";
import path from "path";
import { fastify } from "fastify";

import { RequestDefiner } from "./route_common";

export function createInstance(port: number = 8080) {
    const serverInstance = fastify({
        logger: false
    });

    // Scan route modules
    const routesPath = path.join(__dirname, "routes");
    const routeFiles = fs.readdirSync(routesPath).filter(
        file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
    );

    for (const routeFile of routeFiles) {
        const filePath = path.join(routesPath, routeFile);
        const routeDefiner: RequestDefiner = require(filePath);

        if (routeDefiner.method == "GET") {
            serverInstance.get(routeDefiner.url, async (request, response) => routeDefiner.handlerWrapper(request, response))
        } else if (routeDefiner.method == "POST") {
            serverInstance.post(routeDefiner.url, async (request, response) => routeDefiner.handlerWrapper(request, response))
        }
    }

    serverInstance.listen({port: port})
        .then(() => {
            console.log(`Server is now listening at port ${port}.`);
        })
        .catch((err: any) => {
            console.warn(`Failed to boot up Server: ${err}`);
        })
}