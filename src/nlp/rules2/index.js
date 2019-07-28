'use strict';

const chain = require('../../utils/chain');
const constants = require('../constants');
const coreRules = constants.coreRules;
const fs = require('fs');
const parsePhases = constants.parsePhases;
const path = require('path');
const settings = require('../../settings');
const supportedLanguages = constants.supportedLanguages;
const appDir = settings.appDir;

const DEFAULT_KEY = 'default';
const UNSUPPORTED_PARSE_PHASE = constants.UNSUPPORTED_PARSE_PHASE;

let ruleMap = {
  core: {}
};

let ruleSettingMap = {};

Object.keys(coreRules)
  .forEach(ruleName => ruleMap.core[ruleName] = require(`./${ruleName}`));

class RuleProvider {
  constructor(language, phase, activeSetting) {
    this.activeSetting = activeSetting;
    this.core = ruleMap.core;
    this.language = language;
    this.languageSpecific = null;
    this.rules = null;
    this.phase = phase;
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
            let phaseName = this.getPhaseName();
            let settingPhaseRules = this.getSettingPhaseRules(phaseName);

            settingPhaseRules.forEach(ruleName => {
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

  getPhaseName() {
    return Object.keys(parsePhases).find(
        name => parsePhases[name] === this.phase);
  }

  getRules() {
    if (this.rules == null) {
      let rules = [];
      let core = this.core;
      let languageSpecific = this.getLanguageSpecific();
      let phaseName = this.getPhaseName();
      let settingPhaseRules = this.getSettingPhaseRules(phaseName);

      settingPhaseRules.forEach(ruleName => {
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

  getSettingPhaseRules(phaseName) {
    let activeSetting = this.activeSetting;

    return activeSetting.phaseRules[phaseName.toLowerCase()];
  }
}

function getRules(language, phase) {
  let defaultSetting = getRuleSetting();
  let languageSetting = getRuleSetting(language);
  let ruleSettings = {
    defaultSetting: defaultSetting,
    languageSetting: languageSetting
  };

  return getRulesFromSettings(language, phase, ruleSettings);
}

function getRulesFromSettings(language, phase, ruleSettings) {
  let defaultSetting = ruleSettings.defaultSetting;
  let activeSetting = defaultSetting;
  let languageSetting = ruleSettings.languageSetting;
  let rules;
  let phaseDefined = hasDefinedPhase.apply(languageSetting, [phase]);

  if (phaseDefined === true) {
    activeSetting = languageSetting;
  }

  try {
    rules = new RuleProvider(language, phase, activeSetting).getRules();
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

function hasDefinedPhase(phase) {
  let ruleSetting = this;
  let phaseName = Object.keys(parsePhases).find(
    name => parsePhases[name] === phase);

  return phaseName.toLowerCase() in ruleSetting.phaseRules;
}

function applyTo(parent, phase, callback) {
  let newChildren = [];
  let rules = getRules(parent.getLanguage(), phase);

  rules.forEach(rule => {
    let tokens = rule.applyTo(parent, phase);

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
