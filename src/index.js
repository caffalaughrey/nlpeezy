'use strict';

const chain = require('./utils/chain');
const lemmas = require('./nlp/lemmas');
const tokens = require('./nlp/tokens');

const NLPReadable = require('stream').Readable;

const DEFAULT_CONFIG = {
  useTokenization: true,
  useLemmatization: true
}

module.exports = {
  analyze: function(...args) {
    let config;
    let callback;

    if (args.length === 3) {
       config = args[1];
       callback = args[2];
    } else if (args.length === 2) {
      config = {};
      callback = args[1];
    }

    let useTokenization = DEFAULT_CONFIG.useTokenization;
    let useLemmatization = config.useLemmatization != null ?
      config.useLemmatization : DEFAULT_CONFIG.useLemmatization;

    if (useTokenization) {
      let tokenizationFn;

      switch (true) {
        case typeof args[0] == 'string':
          tokenizationFn = tokens.fromString;
          break;
        case args[0] instanceof NLPReadable:
          tokenizationFn = tokens.fromReadStream;
          break;
      }

      tokenizationFn.apply(tokens, [args[0], config, (err, tokenGroups) => {
        if (err) {
          return callback(err, null);
        } else if (!useLemmatization || tokenGroups.length === 0) {
          return callback(null, tokenGroups);
        } else {
          let storeConfig = {};

          storeConfig.language = config.language;

          lemmas.loadStore(storeConfig, err => {
            chain(tokenGroups, (tokenGroup, next) => {
              lemmas.fromTokenGroup(tokenGroup, config, (err) => {
                if (err) {
                  return next(err); // TODO: Cover
                }

                next();
              });
            }).then(_ => callback(null, tokenGroups))
            .catch(err => callback(err, null)); // TODO: Cover
          });
        }
      }]);
    }
  }
};
