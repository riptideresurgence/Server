import * as core from "@riptide/core";

type RequestData = {[dataName: string]: any};
type RequestQueries = {[queryName: string]: any};
type RequestHandlerFunction = ((data: RequestData, queries: RequestQueries) => ResponseDefiner);
type RequestAsyncHandlerFunction = ((data: RequestData, queries: RequestQueries) => Promise<ResponseDefiner>);

class RequestDefiner {
    private _handlerFunction: RequestHandlerFunction | RequestAsyncHandlerFunction | undefined = undefined;

    public url: string = "unknown";
    public method: "GET" | "POST" = "GET";
    public dataDefine: RequestData = {};
    public queriesDefine: RequestQueries = {};
    public requireApiKey: boolean = false;
    public mustBeBalancer: boolean = false;
    public processPower: number = 0;

    // Internal handlers
    private async _checkForApiKeyHeader(Request: any): Promise<boolean> {
        let receivedApiKey: string | undefined = Request.headers["x-api-key"];
        if (receivedApiKey) {
            return await core.database.
        }

        return false;
    }
    private _createDataFromInfo(Request: any): RequestData {
        let createdData: RequestData = {};
        let receivedData: RequestQueries = Request.body;

        Object.keys(this.dataDefine).forEach((dataName: string) => {
            const dataType = this.dataDefine[dataName];
            let newDataValue = undefined;
            let receivedDataValue = receivedData[dataName];
            if (!receivedDataValue) {
                return;
            }

            if (dataType == "string") {
                newDataValue = receivedDataValue.toString();
            } else if (dataType == "int") {
                newDataValue = parseInt(receivedDataValue.toString());
            } else if (dataType == "string[]") {
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
                    })
                }
            }

            if (newDataValue) {
                createdData[dataName] = newDataValue;
            }
        });

        return createdData;
    }
    private _createQueriesFromInfo(Request: any): RequestQueries {
        let createdQueries: RequestQueries = {};
        let receivedQueries: RequestQueries = Request.query;

        Object.keys(this.queriesDefine).forEach((queryName: string) => {
            const queryType = this.queriesDefine[queryName];
            let newQueryValue = undefined;
            let receivedQueryValue = receivedQueries[queryName];
            if (!receivedQueryValue) {
                return;
            }

            if (queryType == "string") {
                newQueryValue = receivedQueryValue.toString();
            } else if (queryType == "int") {
                newQueryValue = parseInt(receivedQueryValue.toString());
            } else if (queryType == "string[]") {
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
                    })
                }
            }

            if (newQueryValue) {
                createdQueries[queryName] = newQueryValue;
            }
        });

        return createdQueries;
    }

    private async _handler(Request: any, Response: any) {
        if (!this._handlerFunction) {
            return;
        }
        if (this.requireApiKey) {
            if (!(await this._checkForApiKeyHeader(Request))) {
                let responseObject: ResponseDefiner =
                    new ResponseDefiner()
                        .code(HTTP_CODES.AUTH_ERROR)
                        .specificError(COMMON_SERVER_ERRORS.API_KEY_ERROR)
                        .message("Invalid API key.")
                return Response.status(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }
        let data = this._createDataFromInfo(Request);
        let queries = this._createQueriesFromInfo(Request);

        // Data validation
        const dataDefineKeys = Object.keys(this.dataDefine);
        for (let i = 0; i < dataDefineKeys.length; i++) {
            let dataName: string = dataDefineKeys[i];
            let dataType: string = this.dataDefine[dataName];

            if (!data[dataName]) {
                let responseObject: ResponseDefiner =
                    new ResponseDefiner()
                        .code(HTTP_CODES.BAD_REQUEST)
                        .specificError(COMMON_SERVER_ERRORS.INVALID_BODY)
                        .message(`Data "${dataName}" must exist in JSON body and be of type "${dataType}".`)
                return Response.status(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }
        // Query validation
        const queriesDefineKeys = Object.keys(this.queriesDefine);
        for (let i = 0; i < queriesDefineKeys.length; i++) {
            let queryName: string = queriesDefineKeys[i];
            let queryType: string = this.queriesDefine[queryName];

            if (!queries[queryName]) {
                let responseObject: ResponseDefiner =
                    new ResponseDefiner()
                        .code(HTTP_CODES.BAD_REQUEST)
                        .specificError(COMMON_SERVER_ERRORS.INVALID_QUERY)
                        .message(`Query "${queryName}" must exist and be of type "${queryType}".`)
                return Response.status(responseObject.httpResponseCode).send(responseObject.serialize());
            }
        }

        let responseObject: ResponseDefiner = this._handlerFunction.constructor.name === "AsyncFunction" ? await (this._handlerFunction(data, queries) as Promise<ResponseDefiner>) : this._handlerFunction(data, queries) as ResponseDefiner;
        Response.status(responseObject.httpResponseCode).send(responseObject.serialize());
    }

    // Setters
    public attachServerFrontend(frontend: ServerFrontendV2) {
        this._frontend = frontend;
        return this;
    }
    public usingUrl(url: string) {
        this.url = url;
        return this;
    }
    public requestMethod(method: "GET" | "POST") {
        this.method = method;
        return this;
    }
    public setDataBody(dataInfo: RequestData) {
        this.dataDefine = dataInfo;
        return this;
    }
    public setQuery(queriesInfo: RequestQueries) {
        this.queriesDefine = queriesInfo;
        return this;
    }
    public needApiKey(need: boolean) {
        this.requireApiKey = true;
        return this;
    }
    public balancerOnly(balancerOnly: boolean) {
        this.mustBeBalancer = balancerOnly;
        return this;
    }
    public requireProcessPower(power: number) {
        this.processPower = power;
        return this;
    }

    // Main handler
    public on(handlerFunction: RequestHandlerFunction | RequestAsyncHandlerFunction) {
        this._handlerFunction = handlerFunction;
        this._frontend._worker.bind(
            this.url,
            // if passed the function, "this" context will be gone
            // hence we create a new function
            (...args: [any, any]) => this._handler.apply(this, args),
            this.method,
            this.mustBeBalancer,
            this.processPower
        );
    }
}

class ResponseDefiner {
    public httpResponseCode: number = 200;
    public responseMessage: string | undefined = undefined
    public error: string | undefined = undefined;
    public data: {[name: string]: any} | undefined = undefined;

    // Setters
    public code(code: number) {
        this.httpResponseCode = code;
        return this;
    }
    public message(message: string | undefined) {
        this.responseMessage = message;
        return this;
    }
    public specificError(error: string | undefined) {
        this.error = error;
        return this;
    }
    public addData(dataName: string, dataValue: any) {
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
    public serialize() {
        return {
            errorMessage: this.error,
            message: this.responseMessage,
            data: this.data
        }
    }
}