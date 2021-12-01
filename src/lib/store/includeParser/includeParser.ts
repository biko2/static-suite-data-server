import { queryRunner } from '@lib/query';
import { getObjectValue } from '@lib/utils/object';
import { store } from '..';
import { JsonIncludeMetadata } from './includeParser.types';
import { aliasWithoutTypeIncludeParser } from './parsers/types/aliasWithoutTypeIncludeParser';
import {
  configIncludeParser,
  customIncludeParser,
  entityIncludeParser,
  localeIncludeParser,
} from './parsers';

const parseParams = (queryString: string) => {
  // Parse query string.
  const params = new URLSearchParams(queryString);

  const obj: Record<string, any> = {};
  Array.from(params.keys()).forEach((key: string) => {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key);
    } else {
      obj[key] = params.get(key);
    }
  });
  return obj;
};

export const includeParser = {
  static: {
    run: (fileContent: JsonIncludeMetadata): void => {
      if (fileContent) {
        const jsonData = fileContent;
        if (jsonData.metadata?.includes) {
          jsonData.metadata?.includes.forEach((includePath: string) => {
            const includePathValue = getObjectValue(fileContent, includePath);
            const includeData = store.data.get(includePathValue);

            const mountPointPath = includePath.split('.');
            const includeKey = mountPointPath.pop();
            if (includeKey) {
              if (includeKey.toLowerCase().endsWith('configinclude')) {
                configIncludeParser({
                  fileContent,
                  includeData,
                  mountPointPath,
                  includeKey,
                });
              }
              if (includeKey.toLowerCase().endsWith('entityinclude')) {
                entityIncludeParser({
                  fileContent,
                  includeData,
                  mountPointPath,
                  includeKey,
                });
              }
              if (includeKey.toLowerCase().endsWith('custominclude')) {
                customIncludeParser({
                  fileContent,
                  includeData,
                  mountPointPath,
                  includeKey,
                });
              }
              if (includeKey.toLowerCase().endsWith('localeinclude')) {
                localeIncludeParser({
                  fileContent,
                  includeData,
                  mountPointPath,
                  includeKey,
                });
              }
            }
          });
        }
      }
    },
  },
  dynamic: {
    run: (fileContent: JsonIncludeMetadata): void => {
      if (fileContent) {
        const jsonData = fileContent;
        if (jsonData.metadata?.includes) {
          jsonData.metadata?.includes.forEach((includePath: string) => {
            if (includePath.toLowerCase().endsWith('queryinclude')) {
              const queryData = getObjectValue(fileContent, includePath).split(
                '?',
              );
              const queryId = queryData[0];
              let queryArgs = {};
              if (queryData[1]) {
                queryArgs = parseParams(queryData[1]);
              }
              const includeData = queryRunner.run(queryId, queryArgs);
              const mountPointPath = includePath.split('.');
              const includeKey = mountPointPath.pop();
              if (includeKey) {
                aliasWithoutTypeIncludeParser(
                  {
                    fileContent,
                    includeData,
                    mountPointPath,
                    includeKey,
                  },
                  'query',
                );
              }
            }
          });
        }
      }
    },
  },
};
