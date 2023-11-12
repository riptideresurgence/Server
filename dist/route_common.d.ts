declare const HTTP_CODES: {
    OK: number;
    BAD_REQUEST: number;
    AUTH_ERROR: number;
    INTERNAL_SERVER_ERROR: number;
};
declare const COMMON_SERVER_ERRORS: {
    API_KEY_ERROR: string;
    INVALID_BODY: string;
    INVALID_QUERY: string;
    INTERNAL_SERVER_ERROR: string;
};
type RequestData = {
    [dataName: string]: any;
};
type RequestQueries = {
    [queryName: string]: any;
};
type RequestHandlerFunction = ((data: RequestData, queries: RequestQueries) => ResponseDefiner);
type RequestAsyncHandlerFunction = ((data: RequestData, queries: RequestQueries) => Promise<ResponseDefiner>);
declare class RequestDefiner {
    private _handlerFunction;
    url: string;
    method: "GET" | "POST";
    dataDefine: RequestData;
    queriesDefine: RequestQueries;
    requireApiKey: boolean;
    handlerWrapper: (args_0: any, args_1: any) => Promise<any>;
    private _checkForApiKeyHeader;
    private _createDataFromInfo;
    private _createQueriesFromInfo;
    private _handler;
    usingUrl(url: string): this;
    requestMethod(method: "GET" | "POST"): this;
    setDataBody(dataInfo: RequestData): this;
    setQuery(queriesInfo: RequestQueries): this;
    needApiKey(need: boolean): this;
    on(handlerFunction: RequestHandlerFunction | RequestAsyncHandlerFunction): this;
}
declare class ResponseDefiner {
    httpResponseCode: number;
    responseMessage: string | undefined;
    error: string | undefined;
    data: {
        [name: string]: any;
    } | undefined;
    code(code: number): this;
    message(message: string | undefined): this;
    specificError(error: string | undefined): this;
    addData(dataName: string, dataValue: any): this;
    serialize(): {
        errorMessage: string | undefined;
        message: string | undefined;
        data: {
            [name: string]: any;
        } | undefined;
    };
}
export { HTTP_CODES, COMMON_SERVER_ERRORS, RequestData, RequestQueries, RequestDefiner, ResponseDefiner };
