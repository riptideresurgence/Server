"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_common_1 = require("../route_common");
exports.default = new route_common_1.RequestDefiner()
    .usingUrl("/test")
    .requestMethod("GET")
    .needApiKey(false)
    .on(async () => {
    return new route_common_1.ResponseDefiner()
        .code(route_common_1.HTTP_CODES.OK)
        .message("Server is working.");
});
