"use strict";
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const logger = require("pino")();
/**
 * Class Config
 *
 * @class Config
 */
class Config {
    /**
     * Load config from yaml file
     *
     * @static
     * @returns {Object}
     * @memberof Config
     */
    static loadSetting() {
        const conf = {};
        const url = path.join(__dirname, "..", "configs");
        if (process.env.NODE_ENV == null) {
            process.env.NODE_ENV = "development";
        }
        try {
            const doc = yaml.safeLoad(fs.readFileSync(`${url}/${process.env.NODE_ENV}.yml`, "utf8"));
            for (const key of Object.keys(doc)) {
                const val = doc[key];
                if (val != null) {
                    conf[key] = val;
                }
            }
        } catch (err) {
            logger.info(
                `Error when loading configuration file ${process.env.NODE_ENV}.yaml, fallback to configuration.yml`
            );
            try {
                const doc = yaml.safeLoad(fs.readFileSync(`${url}/configuration.yml`, "utf8"));
                for (const key of Object.keys(doc)) {
                    const val = doc[key];
                    if (val != null) {
                        conf[key] = val;
                    }
                }
            } catch (err1) {
                logger.info(
                    `Error when loading configuration file configuration.yml, using default value for each module: ${
                        err1.message
                    }`
                );
            }
        }
        return conf;
    }
}

module.exports = {
    config: Config.loadSetting(),
};
