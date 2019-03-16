"use strict";
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */
module.exports = {
    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    noop: async (req, res, next) => {
        try {
            return res.end();
        } catch (err) {
            return next(err);
        }
    },
};
