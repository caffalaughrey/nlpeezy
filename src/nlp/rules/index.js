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
  return getRuleSetting()
    .then(defaultSetting => mergeRuleSettings(language, phase, defaultSetting))
    .then(ruleSettings => getRulesFromSettings(language, phase, ruleSettings));
}

function getRulesFromSettings(language, phase, ruleSettings) {
  return new Promise((resolve, reject) => {
    let activeSetting;
    let defaultSetting = ruleSettings.defaultSetting;
    let languageSetting = ruleSettings.languageSetting;

    switch (hasDefinedPhase.apply(languageSetting, [phase])) {
      case true:
        activeSetting = languageSetting;
        break;
      case false:
        activeSetting = defaultSetting;
        break;
    }

    try {
      let rules = new RuleProvider(language, phase, activeSetting).getRules();

      return resolve(rules);
    } catch (err) {
      return reject(err);
    }
  });
}

function getRuleSetting(language) {
  return new Promise((resolve, reject) => {
    let key =
      !language || language == supportedLanguages.UNKNOWN ?
        DEFAULT_KEY : language;
    let settingsPath;

    if (key in ruleSettingMap) {
      return resolve(ruleSettingMap[key]);
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

    fs.access(settingsPath, fs.F_OK, err => {
      if (err) {
        return reject(err);
      }

      let ruleSetting;

      try {
        ruleSettingMap[key] = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

        return resolve(ruleSettingMap[key])
      } catch(e) {
        // Dead code unless JSON file corrupt, in which case build will fail.
        return reject(e);
      }
    });
  });
}

function hasDefinedPhase(phase) {
  let ruleSetting = this;
  let phaseName = Object.keys(parsePhases).find(
    name => parsePhases[name] === phase);

  return phaseName.toLowerCase() in ruleSetting.phaseRules;
}

function mergeRuleSettings(language, phase, defaultSetting) {
  return new Promise((resolve, reject) => {
    getRuleSetting(language)
      .then(languageSetting => resolve({
        defaultSetting: defaultSetting,
        languageSetting: languageSetting
      }))
      .catch(err => reject(err));
  });
}

function applyTo(parent, phase, callback) {
  let newChildren = [];

  return getRules(parent.getLanguage(), phase)
    .then((rules) => {
      return chain(rules, (rule, next) => {
        rule.applyTo(parent, phase, (err, tokens) => {
          if (err) return next(err);

          if (tokens && tokens.length > 0) {
            newChildren = newChildren.concat(tokens);
            newChildren.sort((a, b) =>
              a.index > b.index ? 1 : a.index < b.index ? -1 : 0);
          }

          return next();
        })
      }).then(_ => callback(null, newChildren))
      .catch(err => callback(err, null));
  });
}

module.exports = {
  applyTo: applyTo,
  RuleProvider: RuleProvider
};
