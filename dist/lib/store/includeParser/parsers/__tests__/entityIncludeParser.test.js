"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityIncludeParser_1 = require("../entityIncludeParser");
describe('entityIncludeParser', () => {
    it('mounts data on correct path', () => {
        const fileContent = {
            data: {
                content: {
                    entity: {
                        entityInclude: 'xxx',
                    },
                },
            },
        };
        (0, entityIncludeParser_1.entityIncludeParser)({
            fileContent,
            includeData: { data: { content: { includedData: 'yyy' } } },
            mountPointPath: ['data', 'content', 'entity'],
            includeKey: 'entityInclude',
        });
        expect(fileContent.data.content.entity).toStrictEqual({
            includedData: 'yyy',
        });
    });
    it('returns undefined when includeData has not data.content structure', () => {
        const fileContent = {
            data: {
                content: {
                    entity: {
                        entityInclude: 'xxx',
                    },
                },
            },
        };
        (0, entityIncludeParser_1.entityIncludeParser)({
            fileContent,
            includeData: { includedData: 'yyy' },
            mountPointPath: ['data', 'content', 'entity'],
            includeKey: 'entityInclude',
        });
        expect(fileContent.data.content.entity).toBeUndefined();
    });
});
