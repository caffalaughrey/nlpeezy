'use strict';
const chain = require('../utils/chain');
const constants = require('./constants');
const parserEvents = constants.parserEvents;
const rules = require('./rules/index');
const strategies = require('../utils/datastores').strategies;
const supportedLanguages = constants.supportedLanguages;

const Lemma = require('./classes/Lemma');
const LemmaStore = require('./classes/LemmaStore');
const LexicalToken = require('./classes/LexicalToken');
const UnprocessedToken = require('./classes/UnprocessedToken');

let lemmaStores = {};

module.exports = {
  fromTokenGroup: function(tokenGroup, config, callback) {
    let lemmas;
    let language = tokenGroup.getLanguage();

    if (language == supportedLanguages.UNKNOWN) {
      return callback(null, null);
    }

    let lemmaStore = lemmaStores[language];

    if (!lemmaStore) {
      // TODO: execute callback early with error
    }

    let tokens = tokenGroup.filterMap(token => token instanceof LexicalToken ||
      token instanceof UnprocessedToken ? token.getValue().toLowerCase()
      : undefined);

    return chain(tokens, (token, next) => {
      lemmaStore.get(token, (err, values) => {
        if (err) return next(err);

        if (!lemmas) {
          lemmas = {};
        }

        lemmas[token] = values || token;

        next();
      });
    }).then(_ => {
      tokenGroup.setLemmasMap(lemmas);
      tokenGroup.parse(parserEvents.LEMMAS, rules);

      callback(null, lemmas);
    }).catch(err => callback(err, null));
  },
  loadStore: function(config, callback) {
    config.strategy = config.strategy || strategies.REDIS;

    let language = config.language;

    if (lemmaStores[language]) {
      return callback(null);
    }

    let err;

    try {
      lemmaStores[language] = new LemmaStore(config);

      lemmaStores[language].initClient();

      return lemmaStores[language].load(callback);
    } catch (err) {
      return callback(err);
    }
  }
};
