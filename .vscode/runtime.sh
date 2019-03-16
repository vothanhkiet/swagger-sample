#!/bin/bash
node $* | node ../node_modules/.bin/pino-pretty --colorize --levelFirst --translateTime
