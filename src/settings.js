
/**
 * @desc Reads the appropriate settings json file, parses it, and exports it as
 * an object.
 */

'use strict';

/**
 * ignore
 */
const isTest = typeof global.it === 'function',
    fs = require('fs'),
    path = require('path'),
    appDir = path.resolve(path.join(__dirname, '..')),
    settingsFile = isTest ? 'settings.test.json' : 'settings.prod.json',
    settingsPath = path.join(appDir, settingsFile),
    settingsBuf = fs.readFileSync(settingsPath, 'utf8'),
    settings = JSON.parse(settingsBuf);

settings.isTest = isTest;
settings.env = process.env.NODE_ENV || 'dev';
settings.appDir = appDir;

module.exports = settings;
