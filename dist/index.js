"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInstance = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fastify_1 = require("fastify");
function createInstance(port = 8080) {
    const serverInstance = (0, fastify_1.fastify)({
        logger: false
    });
    // Scan route modules
    const routesPath = path_1.default.join(__dirname, "routes");
    const routeFiles = fs_1.default.readdirSync(routesPath).filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'));
    for (const routeFile of routeFiles) {
        const filePath = path_1.default.join(routesPath, routeFile);
        const routeDefiner = require(filePath);
        if (routeDefiner.method == "GET") {
            serverInstance.get(routeDefiner.url, async (request, response) => routeDefiner.handlerWrapper(request, response));
        }
        else if (routeDefiner.method == "POST") {
            serverInstance.post(routeDefiner.url, async (request, response) => routeDefiner.handlerWrapper(request, response));
        }
    }
    serverInstance.listen({ port: port })
        .then(() => {
        console.log(`Server is now listening at port ${port}.`);
    })
        .catch((err) => {
        console.warn(`Failed to boot up Server: ${err}`);
    });
}
exports.createInstance = createInstance;
