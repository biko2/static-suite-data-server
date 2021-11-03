const fs = require('fs');
const { resolve } = require('path');

const config = Object.create(null); // no inherited properties

/**
 * Configure the data server.
 *
 * @param {Object} options Configuration options
 * @param {string} options.dataDir - Relative path to the directory where data is stored.
 * @param {string} options.workDir - Relative path to the directory where work data is stored.
 * @param {string} options.queryDir - Relative path to the directory where queries are stored.
 * @param {string} options.postProcessor - Relative path to the post processor module.
 * @param {string} options.runMode - Run mode (dev or prod).
 *
 * @return {Object} - The config object.
 */
const setConfig = (options = {}) => {
  const localOptions = options;
  // Check that required options are provided
  if (!localOptions.dataDir) {
    throw Error('Required option not provided: "dataDir".');
  }
  localOptions.dataDir = resolve(localOptions.dataDir);
  if (
    !fs.existsSync(localOptions.dataDir) ||
    !fs.lstatSync(localOptions.dataDir).isDirectory()
  ) {
    throw Error(`Cannot find dataDir directory: "${localOptions.dataDir}"`);
  }

  if (localOptions.workDir) {
    localOptions.workDir = resolve(localOptions.workDir);
    if (
      !fs.existsSync(localOptions.workDir) ||
      !fs.lstatSync(localOptions.workDir).isDirectory()
    ) {
      throw Error(`Cannot find workDir directory: "${localOptions.workDir}"`);
    }
  }

  if (localOptions.queryDir) {
    localOptions.queryDir = resolve(localOptions.queryDir);
    if (
      !fs.existsSync(localOptions.queryDir) ||
      !fs.lstatSync(localOptions.queryDir).isDirectory()
    ) {
      throw Error(`Cannot find queryDir directory: ${localOptions.queryDir}`);
    }
  }

  if (localOptions.postProcessor) {
    localOptions.postProcessor = resolve(localOptions.postProcessor);
    if (!fs.existsSync(localOptions.postProcessor)) {
      throw Error(
        `Cannot find postProcessor module: ${localOptions.postProcessor}`,
      );
    }
  }

  if (!localOptions.runMode) {
    throw Error('Required option not provided: "runMode"');
  }
  if (!['dev', 'prod'].includes(localOptions.runMode)) {
    throw Error(
      `Invalid value provided for "runMode": "${localOptions.runMode}". Valid options are "dev" or "prod"`,
    );
  }

  Object.keys(localOptions).forEach(key => {
    Object.defineProperty(config, key, {
      enumerable: true,
      configurable: false,
      writable: false,
      // Remove leading slash from all directories if applies.
      value: typeof localOptions[key] === 'string'?localOptions[key].replace(/\/$/, ''):localOptions[key],
    });
  });
  return config;
};

module.exports.config = config;
module.exports.setConfig = setConfig;
