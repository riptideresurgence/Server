import { HTTP_CODES, COMMON_SERVER_ERRORS, RequestDefiner, ResponseDefiner } from "../route_common";

import * as core from "@riptide/core";

export default new RequestDefiner()
    .usingUrl("/api/player/fetchbanlist")
    .requestMethod("GET")
    .needApiKey(false)
    .on(async () => {
        return await new Promise((resolve, _) => {
            core.player.getBanList()
                .then((documents) => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.OK)
                            .addData("documents", documents)
                    )
                })
                .catch((err: any) => {
                    resolve(
                        new ResponseDefiner()
                            .code(HTTP_CODES.INTERNAL_SERVER_ERROR)
                            .specificError(COMMON_SERVER_ERRORS.INTERNAL_SERVER_ERROR)
                            .message(`Failed to fetch ban list: ${err}`)
                    )
                })
        });
    });