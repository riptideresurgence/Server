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
exports.ResponseDefiner = exports.RequestDefiner = exports.COMMON_SERVER_ERRORS = exports.HTTP_CODES = void 0;
const core = __importStar(require("@riptide/core"));
const HTTP_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    AUTH_ERROR: 401,
    INTERNAL_SERVER_ERROR: 500
};
exports.HTTP_CODES = HTTP_CODES;
const COMMON_SERVER_ERRORS = {
    API_KEY_ERROR: "API_KEY_ERROR",
    INVALID_BODY: "INVALID_BODY",
    INVALID_QUERY: "INVALID_QUERY",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};
exports.COMMON_SERVER_ERRORS = COMMON_SERVER_ERRORS;
class RequestDefiner {
    constructor() {
        this._handlerFunction = undefined;
        this.url = "unknown";
        this.method = "GET";
        this.dataDefine = {};
        this.queriesDefine = {};
        this.requireApiKey = false;
        this.handlerWrapper = (...args) => this._handler.apply(this, args);
    }
    // Internal handlers
    async _checkForApiKeyHeader(Request) {
        let receivedApiKey = Request.headers["x-api-key"];
        if (receivedApiKey) {
            return await core.database.findApiKeyDocumentFromApiKey(receivedApiKey) != undefined;
        }
        return false;
    }
    _createDataFromInfo(Request) {
        let createdData = {};
        let receivedData = Request.body;
        Object.keys(this.dataDefine).forEach((dataName) => {
            const dataType = this.dataDefine[dataName];
            let newDataValue = undefined;
            let receivedDataValue = receivedData[dataName];
            if (!receivedDataValue) {
                return;
            }
            if (dataType == "string") {
                newDataValue = receivedDataValue.toString();
            }
            else if (dataType == "int") {
                newDataValue = parseInt(receivedDataValue.toString());
            }
            else if (dataType == "string[]") {
                if (Array.isArray(receivedDataValue)) {
                    newDataValue = [];
                    receivedDataValue.forEach((e) => {
                        if (!e) {
                            return;
                        }
                        const toAdd = e.toString();
                        if (toAdd) {
                            newDataValue.push(toAdd);
                        }
                    });
                }
            }
            if (newDataValue) {
                createdData[dataName] = newDataValue;
            }
        });
        return createdData;
    }
    _createQueriesFromInfo(Request) {
        let createdQueries = {};
        let receivedQueries = Request.query;
        Object.keys(this.queriesDefine).forEach((queryName) => {
            const queryType = this.queriesDefine[queryName];
            let newQueryValue = undefined;
            let receivedQueryValue = receivedQueries[queryName];
            if (!receivedQueryValue) {
                return;
            }
            if (queryType == "string") {
                newQueryValue = receivedQueryValue.toString();
            }
            else if (queryType == "int") {
                newQueryValue = parseInt(receivedQueryValue.toString());
            }
            else if (queryType == "string[]") {
                if (Array.isArray(receivedQueryValue)) {
                    newQueryValue = [];
                    receivedQueryValue.forEach((e) => {
                        if (!e) {
                            return;
                        }
                        const toAdd = e.toString();
                        if (toAdd) {
                            newQueryValue.push(toAdd);
                        }
                    });
                }
            }
            if (newQueryValue) {
                createdQueries[queryName] = newQueryValue;
            }
        });
        return createdQueries;
    }
    async _handler(Request, Response) {
        if (!this._handlerFunction) {
            return;
        }
        if (this.requireApiKey) {
            if (!(await this._checkForApiKeyHeader(Request))) {
                let responseObject = new ResponseDefiner()
                    .code(HTTP_CODES.AUTH_ERROR)
                    .specificError(COMMON_SERVER_ERRORS.API_KEY_ERROR)
                    .message("Invalid API key.");
                return Response.code(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }
        let data = this._createDataFromInfo(Request);
        let queries = this._createQueriesFromInfo(Request);
        // Data validation
        const dataDefineKeys = Object.keys(this.dataDefine);
        for (let i = 0; i < dataDefineKeys.length; i++) {
            let dataName = dataDefineKeys[i];
            let dataType = this.dataDefine[dataName];
            if (!data[dataName]) {
                let responseObject = new ResponseDefiner()
                    .code(HTTP_CODES.BAD_REQUEST)
                    .specificError(COMMON_SERVER_ERRORS.INVALID_BODY)
                    .message(`Data "${dataName}" must exist in JSON body and be of type "${dataType}".`);
                return Response.code(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }
        // Query validation
        const queriesDefineKeys = Object.keys(this.queriesDefine);
        for (let i = 0; i < queriesDefineKeys.length; i++) {
            let queryName = queriesDefineKeys[i];
            let queryType = this.queriesDefine[queryName];
            if (!queries[queryName]) {
                let responseObject = new ResponseDefiner()
                    .code(HTTP_CODES.BAD_REQUEST)
                    .specificError(COMMON_SERVER_ERRORS.INVALID_QUERY)
                    .message(`Query "${queryName}" must exist and be of type "${queryType}".`);
                return Response.code(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }
        let responseObject = this._handlerFunction.constructor.name === "AsyncFunction" ? await this._handlerFunction(data, queries) : this._handlerFunction(data, queries);
        Response.code(responseObject.httpResponseCode).send(responseObject.serialize());
    }
    // Setters
    usingUrl(url) {
        this.url = url;
        return this;
    }
    requestMethod(method) {
        this.method = method;
        return this;
    }
    setDataBody(dataInfo) {
        this.dataDefine = dataInfo;
        return this;
    }
    setQuery(queriesInfo) {
        this.queriesDefine = queriesInfo;
        return this;
    }
    needApiKey(need) {
        this.requireApiKey = need;
        return this;
    }
    // Main handler
    on(handlerFunction) {
        this._handlerFunction = handlerFunction;
        return this;
        /*this._frontend._worker.bind(
            this.url,
            // if passed the function, "this" context will be gone
            // hence we create a new function
            (...args: [any, any]) => this._handler.apply(this, args),
            this.method,
            this.mustBeBalancer,
            this.processPower
        );*/
    }
}
exports.RequestDefiner = RequestDefiner;
class ResponseDefiner {
    constructor() {
        this.httpResponseCode = 200;
        this.responseMessage = undefined;
        this.error = undefined;
        this.data = undefined;
    }
    // Setters
    code(code) {
        this.httpResponseCode = code;
        return this;
    }
    message(message) {
        this.responseMessage = message;
        return this;
    }
    specificError(error) {
        this.error = error;
        return this;
    }
    addData(dataName, dataValue) {
        if (!this.data) {
            this.data = {};
        }
        if (!dataValue) {
            return this;
        }
        this.data[dataName] = dataValue;
        return this;
    }
    // Main thingy
    serialize() {
        return {
            errorMessage: this.error,
            message: this.responseMessage,
            data: this.data
        };
    }
}
exports.ResponseDefiner = ResponseDefiner;
