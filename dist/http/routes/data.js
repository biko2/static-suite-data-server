"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const store_1 = require("@lib/store");
const logger_1 = require("@lib/utils/logger");
const serveDataFile = (req, res, storeItem) => {
    logger_1.logger.debug(`DEBUG: type ${typeof storeItem}`);
    logger_1.logger.warn(`Rendering "${storeItem.__FILENAME__ || 'unknown filename'}" (route: ${req.params[0]})`);
    res.status(200);
    res.set({
        'Content-Type': mime_types_1.default.lookup(storeItem.__FILENAME__ || req.params[0]) || 'text/plain',
    });
    res.send(storeItem);
};
const data = (req, res) => {
    const paramPath = req.params[0];
    const storePathParts = !paramPath || paramPath === '' ? null : paramPath.split('/');
    const storeItem = storePathParts
        ? storePathParts.reduce((prev, curr) => prev && prev[curr], store_1.store.data)
        : store_1.store.data;
    if (storeItem && (storeItem.__FILENAME__ || typeof storeItem === 'string')) {
        return serveDataFile(req, res, storeItem);
    }
    const storePath = storePathParts
        ? storePathParts.reduce((prev, curr) => {
            if (curr.match(/^[_a-zA-Z0-9]+$/) && !curr.match(/^[0-9]+$/)) {
                return `${prev}.${curr}`;
            }
            return `${prev}['${curr}']`;
        }, '')
        : '';
    const breadcrumbs = storePathParts
        ? storePathParts.map((pathPart, index) => ({
            title: pathPart,
            url: storePathParts.slice(0, index + 1).join('/'),
        }))
        : [];
    if (storeItem && storeItem instanceof Map) {
        const items = [];
        storeItem.forEach((item, key) => {
            items.push({
                name: key,
                type: typeof item,
            });
        });
        const vars = {
            base: '',
            path: storePath,
            breadcrumbs,
            items,
            count: items.length,
            hasContentInfo: false,
        };
        return res.render('data', vars);
    }
    const keys = storeItem ? Object.keys(storeItem) : [];
    let hasContentInfo = false;
    const items = keys.map(entry => {
        let info = null;
        if (storeItem[entry].__FILENAME__) {
            info = {
                filename: storeItem[entry].__FILENAME__,
            };
            hasContentInfo = true;
            if (storeItem[entry].data?.content) {
                const content = storeItem[entry].data?.content;
                const { id, type, bundle, isPublished, title } = content;
                if (id || type || bundle || title) {
                    info = {
                        id,
                        type,
                        bundle,
                        isPublished,
                        title,
                        filename: storeItem[entry].__FILENAME__,
                        size: JSON.stringify(storeItem[entry]).length,
                    };
                    hasContentInfo = true;
                }
            }
        }
        return {
            name: entry,
            type: Array.isArray(storeItem[entry]) ? 'array' : typeof storeItem[entry],
            info,
        };
    });
    const vars = {
        base: paramPath ? `${paramPath}/` : '',
        path: storePath,
        breadcrumbs,
        items,
        count: items.length,
        hasContentInfo,
    };
    return res.render('data', vars);
};
exports.data = data;
