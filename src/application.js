"use strict";
const { config } = require("./libs/configuration");
const { Server } = require("./transport/http/server");
new Server(config.http).start();
