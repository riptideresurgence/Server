import { HTTP_CODES, COMMON_SERVER_ERRORS, RequestDefiner, RequestData, ResponseDefiner } from "../route_common";

import * as core from "@riptide/core";

module.exports = new RequestDefiner()
    .usingUrl("/api/player/ban")
    .requestMethod("POST")
    .setDataBody({
        userId: "int",
        banDuration: "int",
        reason: "string",
        moderator: "string"
    })
    .needApiKey(true)
    .on(async (data: RequestData, _) => {
        if (data.banDuration != -1 && data.banDuration < 0) {
            return new ResponseDefiner()
                .code(HTTP_CODES.BAD_REQUEST)
                .specificError(COMMON_SERVER_ERRORS.INVALID_BODY)
                .message("Ban duration cannot be negative. (Can be set to -1 for infinite duration.)")
        }

        return await new Promise((resolve, _) => {
            core.player.banPlayer("API", data.userId, data.banDuration, data.moderator, data.reason)
                .then(() => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.OK)
                            .addData("banned", true)
                    )
                })
                .catch((err: any) => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.INTERNAL_SERVER_ERROR)
                            .specificError(COMMON_SERVER_ERRORS.INTERNAL_SERVER_ERROR)
                            .message(`Failed to ban ${data.userId}: ${err}`)
                            .addData("banned", false)
                    )
                })
        });
    });