'use strict';

const chain = require('../../utils/chain');
const constants = require('../constants');
const coreRules = constants.coreRules;
const fs = require('fs');
const parserEvents = constants.parserEvents;
const path = require('path');
const settings = require('../../settings');
const supportedLanguages = constants.supportedLanguages;
const appDir = settings.appDir;

const DEFAULT_KEY = 'default';
const UNSUPPORTED_PARSE_EVENT = constants.UNSUPPORTED_PARSE_EVENT;

let ruleMap = {
  core: {}
};

let ruleSettingMap = {};

Object.keys(coreRules)
  .forEach(ruleName => ruleMap.core[ruleName] = require(`./${ruleName}`));

class RuleProvider {
  constructor(language, eventType, activeSetting) {
    this.activeSetting = activeSetting;
    this.core = ruleMap.core;
    this.language = language;
    this.languageSpecific = null;
    this.rules = null;
    this.eventType = eventType;
  }

  getLanguageSpecific() {
    if (this.languageSpecific == null) {
      let languageSpecific;
      let key = this.language == supportedLanguages.UNKNOWN ?
        null : this.language;

      switch (true) {
        case key && key in ruleMap:
          languageSpecific = ruleMap[key];
          break;
        case key && !(key in ruleMap):
          ruleMap[key] = {};
          languageSpecific = ruleMap[key];

          if (Object.entries(languageSpecific).length === 0) {
            let core = this.core;
            let eventName = this.getEventName();
            let settingEventRules = this.getSettingEventRules(eventName);

            settingEventRules.forEach(ruleName => {
              if (!(ruleName in core)) {
                languageSpecific[ruleName] = require(`./${key}/${ruleName}`)
              }
            });
          }
          break;
        default:
          return {};
      }

      this.languageSpecific = languageSpecific;
    }

    return this.languageSpecific;
  }

  getEventName() {
    return Object.keys(parserEvents).find(
        name => parserEvents[name] === this.eventType);
  }

  getRules() {
    if (this.rules == null) {
      let rules = [];
      let core = this.core;
      let languageSpecific = this.getLanguageSpecific();
      let eventName = this.getEventName();
      let settingEventRules = this.getSettingEventRules(eventName);

      settingEventRules.forEach(ruleName => {
        switch (true) {
          case ruleName in languageSpecific:
            rules.push(languageSpecific[ruleName]);
            break;
          case ruleName in core:
            rules.push(core[ruleName]);
            break;
        }
      });

      this.rules = rules;
    }

    return this.rules;
  }

  getSettingEventRules(eventName) {
    let activeSetting = this.activeSetting;

    return activeSetting.eventRules[eventName.toLowerCase()];
  }
}

function getRules(language, eventType) {
  let defaultSetting = getRuleSetting();
  let languageSetting = getRuleSetting(language);
  let ruleSettings = {
    defaultSetting: defaultSetting,
    languageSetting: languageSetting
  };

  return getRulesFromSettings(language, eventType, ruleSettings);
}

function getRulesFromSettings(language, eventType, ruleSettings) {
  let defaultSetting = ruleSettings.defaultSetting;
  let activeSetting = defaultSetting;
  let languageSetting = ruleSettings.languageSetting;
  let rules;
  let isDefined = hasDefinedEvent.apply(languageSetting, [eventType]);

  if (isDefined === true) {
    activeSetting = languageSetting;
  }

  try {
    rules = new RuleProvider(language, eventType, activeSetting).getRules();
  } catch (e) { /* istanbul ignore next */
    throw e; // TODO: throw a TypedError instead
  }

  return rules;
}

function getRuleSetting(language) {
  let key =
    !language || language == supportedLanguages.UNKNOWN ?
      DEFAULT_KEY : language;
  let settingsPath;

  if (key in ruleSettingMap) {
    return ruleSettingMap[key];
  }

  switch (key) {
    case DEFAULT_KEY:
      settingsPath =
        path.join(appDir, 'src', 'nlp', 'rules', 'settings.default.json');
      break;
    default:
      settingsPath =
        path.join(appDir, 'src', 'nlp', 'rules', language, 'settings.json');
  }

  try {
    fs.accessSync(settingsPath, fs.F_OK);

    ruleSettingMap[key] = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) { /* istanbul ignore next */
    throw e; // TODO: throw a TypedError instead
  }

  return ruleSettingMap[key];
}

function hasDefinedEvent(eventType) {
  let ruleSetting = this;
  let eventName = Object.keys(parserEvents).find(
    name => parserEvents[name] === eventType);

  return eventName.toLowerCase() in ruleSetting.eventRules;
}

function applyTo(parent, eventType, callback) {
  let newChildren = [];
  let rules = getRules(parent.getLanguage(), eventType);

  rules.forEach(rule => {
    let tokens = rule.applyTo(parent, eventType);

    if (tokens && tokens.length > 0) {
      newChildren = newChildren.concat(tokens);
      newChildren.sort((a, b) =>
        a.index > b.index ? 1 : a.index < b.index ? -1 : 0);
    }
  });

  return newChildren;
}

module.exports = {
  applyTo: applyTo,
  RuleProvider: RuleProvider
};
