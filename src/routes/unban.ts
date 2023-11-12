import { HTTP_CODES, COMMON_SERVER_ERRORS, RequestDefiner, RequestData, ResponseDefiner } from "../route_common";

import * as core from "@riptide/core";

export default new RequestDefiner()
    .usingUrl("/api/player/unban")
    .requestMethod("POST")
    .setDataBody({
        userId: "int"
    })
    .needApiKey(true)
    .on(async (data: RequestData, _) => {
        return await new Promise((resolve, _) => {
            core.player.unbanPlayer(data.userId)
                .then(() => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.OK)
                            .addData("unbanned", true)
                    )
                })
                .catch((err: any) => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.INTERNAL_SERVER_ERROR)
                            .specificError(COMMON_SERVER_ERRORS.INTERNAL_SERVER_ERROR)
                            .message(`Failed to unban ${data.userId}: ${err}`)
                            .addData("unbanned", false)
                    )
                })
        });
    });