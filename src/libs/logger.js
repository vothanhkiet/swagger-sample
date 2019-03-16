"use strict";
const pino = require("pino");

module.exports = {
    /** @type {pino.Logger} */
    logger: pino({ name: "process", enabled: process.env.NO_LOG !== "true" }),
    /** @type {pino.Logger} */
    transport: pino({ name: "transport", enabled: process.env.NO_LOG !== "true" }),
};
