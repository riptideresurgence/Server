import { HTTP_CODES, RequestDefiner, ResponseDefiner } from "../route_common";

export default new RequestDefiner()
    .usingUrl("/test")
    .requestMethod("GET")
    .needApiKey(false)
    .on(async () => {
        return new ResponseDefiner()
            .code(HTTP_CODES.OK)
            .message("Server is working.")
    });