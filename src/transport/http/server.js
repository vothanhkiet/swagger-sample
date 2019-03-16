"use strict";
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const httpServer = require("http");
const jsYaml = require("js-yaml");
const path = require("path");
const swaggerTools = require("swagger-tools");
const { defaultsDeep } = require("lodash");
const { logger } = require("../../libs/logger");
const { swaggerMiddleWare } = require("./middlewares/swagger");
/**
 * Express Application Wrapper
 *
 * @class Application
 */
class Server {
    /**
     * Creates an instance of Application.
     * @param {Object} opts
     * @memberof Application
     */
    constructor(opts = {}) {
        const defaultOpts = {
            port: 3000
        };
        this.opts = defaultsDeep(opts, defaultOpts);
        this.app = express();
        this.app.locals.title = "gHealth Consultant Service";
        this.app.enable("case sensitive routing");
        this.app.enable("trust proxy");
        this.app.disable("x-powered-by");
        this.app.disable("etag");
        this.logger = logger;
        this.swaggerOpts = {
            controllers: path.join(__dirname, "routes/v1"), // "./routes/v1",
            useStubs: false
        };
        this.swaggerDoc = {
            swagger: "2.0",
            paths: {},
            info: {
                version: "1.0.0",
                title: "swagger"
            }
        };
    }

    loadSwaggerFile() {
        const url = path.join(__dirname, "../../docs/swagger.yml");
        try {
            this.swaggerDoc = jsYaml.safeLoad(fs.readFileSync(url, "utf8"));
            this.logger.info("Load swagger file success", url);
            if (process.env.NODE_ENV === "development") {
                this.swaggerDoc.host = "localhost:3000";
            }
        } catch (err) {
            this.logger.error(err.message, err);
        }
    }

    async loadMiddleWare() {
        const middleware = await new Promise(resolve => {
            swaggerTools.initializeMiddleware(this.swaggerDoc, result => {
                resolve(result);
            });
        });

        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        this.app.use(middleware.swaggerMetadata());
        this.app.use(
            middleware.swaggerSecurity({
                Bearer: async (req, def, scopes, callback) => {
                    try {
                        return callback(null);
                    } catch (err) {
                        return callback(err);
                    }
                }
            })
        );
        // Validate Swagger requests
        this.app.use(middleware.swaggerValidator());
        // Route validated requests to appropriate controller
        this.app.use(middleware.swaggerRouter(this.swaggerOpts));
        // Route validated requests to appropriate controller
        this.app.use(swaggerMiddleWare(this.swaggerDoc, this.swaggerOpts));
        // Serve the Swagger documents and Swagger UI
        this.app.use(
            middleware.swaggerUi({
                swaggerUi: "/api/docs",
                apiDocs: "/api/docs/swagger.json"
            })
        );
        this.app.use((req, res, next) => {
            next(new Error("Not Found"));
        });
        // eslint-disable-next-line no-unused-vars
        this.app.use((err, req, res, next) => {
            res.status(500);
            res.json(err);
        });
        return this.app;
    }

    /**
     * Start application
     *
     * @memberof Application
     */
    async start() {
        this.loadSwaggerFile();
        await this.loadMiddleWare();
        this.logger.info("System all green");

        process.on("unhandledRejection", reason => {
            this.logger.error(`unhandledRejection: ${reason}`);
        });
        process.on("uncaughtException", err => {
            this.logger.error(err.message, err);
        });
        httpServer.createServer(this.app).listen(this.opts.port, () => {
            this.logger.info("Your server is listening on port %d", this.opts.port);
        });
    }
}

module.exports = {
    Server: Server
};
