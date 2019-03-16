"use strict";
const path = require("path");
const fs = require("fs");
const express = require("express");
const _ = require("lodash");

const handlerCacheFromDir = function(dirOrDirs) {
    const handlerCache = {};
    const jsFileRegex = /\.(coffee|js|ts)$/;
    let dirs = [];

    if (_.isArray(dirOrDirs)) {
        dirs = dirOrDirs;
    } else {
        dirs.push(dirOrDirs);
    }

    _.each(dirs, dir => {
        _.each(fs.readdirSync(dir), file => {
            const controllerName = file.replace(jsFileRegex, "");
            let controller;
            if (file.match(jsFileRegex)) {
                controller = require(path.resolve(path.join(dir, controllerName)));
                if (_.isPlainObject(controller)) {
                    _.each(controller, (value, name) => {
                        const handlerId = `${controllerName}_${name}`;
                        if (_.isFunction(value) && !handlerCache[handlerId]) {
                            handlerCache[handlerId] = value;
                        }
                    });
                }
            }
        });
    });

    return handlerCache;
};

/**
 *
 * @return {express.Router}
 */
const SwaggerMiddleWare = (swagger, options) => {
    const defaultOptions = {
        controllers: {},
        useStubs: false, // Should we set this automatically based on process.env.NODE_ENV?
    };

    // eslint-disable-next-line
    let handlerCache = {};
    options = _.defaults(options || {}, defaultOptions);
    if (_.isPlainObject(options.controllers)) {
        _.each(options.controllers, func => {
            if (!_.isFunction(func)) {
                throw new Error("options.controllers values must be functions");
            }
        });
        handlerCache = options.controllers;
    } else {
        // Create the handler cache from the modules in the controllers directory
        handlerCache = handlerCacheFromDir(options.controllers);
    }

    /* eslint-disable  */
    const router = express.Router();

    return router;
};

module.exports = {
    swaggerMiddleWare: SwaggerMiddleWare,
};
