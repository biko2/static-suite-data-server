"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.configureLogger = exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const winston_1 = __importDefault(require("winston"));
const logger_types_1 = require("./logger.types");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_types_1.LogLevel; } });
const customFormat = winston_1.default.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`);
const combinedFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), customFormat);
const logger = winston_1.default.createLogger({
    levels: winston_1.default.config.npm.levels,
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        // Write all logs with level `info` and below to console
        new winston_1.default.transports.Console({
            format: combinedFormat,
        }),
    ],
});
exports.logger = logger;
/**
 * Sets the logger log file and its level
 *
 * @param logFilePath - Absolute path to the log file
 * @param level - Optional log level, defaults to "warn"
 */
const setLogFile = (logFilePath, level = logger_types_1.LogLevel.WARN) => {
    const fileTransport = new winston_1.default.transports.File({
        filename: path_1.default.basename(logFilePath),
        dirname: path_1.default.dirname(logFilePath),
        format: combinedFormat,
        level,
    });
    logger.add(fileTransport);
};
const configureLogger = (level, logFile) => {
    if (level) {
        logger.level = level;
    }
    if (logFile && logFile.path) {
        const logFileAbsolute = (0, path_1.resolve)(logFile.path);
        // Check if file dirname is writable.
        try {
            fs_1.default.accessSync(path_1.default.dirname(logFileAbsolute), fs_1.default.constants.W_OK);
        }
        catch (e) {
            // Log error and rethrow.
            logger.error(`Log file "${logFileAbsolute}" is not writable: ${e}`);
            throw e;
        }
        setLogFile(logFileAbsolute, logFile.level);
    }
};
exports.configureLogger = configureLogger;