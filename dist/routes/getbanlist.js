"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const route_common_1 = require("../route_common");
const core = __importStar(require("@riptide/core"));
module.exports = new route_common_1.RequestDefiner()
    .usingUrl("/api/player/fetchbanlist")
    .requestMethod("GET")
    .needApiKey(false)
    .on(async () => {
    return await new Promise((resolve, _) => {
        core.player.getBanList()
            .then((documents) => {
            resolve(new route_common_1.ResponseDefiner()
                .code(route_common_1.HTTP_CODES.OK)
                .addData("documents", documents));
        })
            .catch((err) => {
            resolve(new route_common_1.ResponseDefiner()
                .code(route_common_1.HTTP_CODES.INTERNAL_SERVER_ERROR)
                .specificError(route_common_1.COMMON_SERVER_ERRORS.INTERNAL_SERVER_ERROR)
                .message(`Failed to fetch ban list: ${err}`));
        });
    });
});
