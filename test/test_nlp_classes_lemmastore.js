'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;
const strategies = require('../src/utils/datastores').strategies;
const supportedLanguages = constants.supportedLanguages;

const LemmaStore = require('../src/nlp/classes/LemmaStore');

const BASIC_MEM_CONFIG = {
  language: supportedLanguages.IRISH,
  strategy: strategies.MEMORY
};
const BASIC_REDIS_CONFIG = {
  language: supportedLanguages.IRISH,
  strategy: strategies.REDIS
}
const LEMMAS_NAMESPACE = constants.namespaces.LEMMAS;
const UNEXPECTED_LENGTH = messages.UNEXPECTED_LENGTH;
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;

describe('/nlp/classes/LemmaStore', () => {
	describe('#LemmaStore', () => {
    it('knows a lemma store it loaded into memory from basic config', done => {
      let config = BASIC_MEM_CONFIG;
      let lemmaStore = new LemmaStore(config);

      lemmaStore.initClient();
      lemmaStore.load(err => {
        if (err) {
          throw err;
        }

        let langCode = lemmaStore.language.toUpperCase();
        let sampleKey = 'abraimis';
        let namespacedKey = lemmaStore.client.getNamespacedKey(sampleKey);
        let namespace = `${LEMMAS_NAMESPACE}_${langCode}`;
        let separator = lemmaStore.separator;

        assert(namespacedKey == `${namespace}${separator}${sampleKey}`,
          UNEXPECTED_VALUE);

        done();
      });
    });

    it('knows a lemma store it loaded into redis from basic config', done => {
      let config = BASIC_REDIS_CONFIG;
      let lemmaStore = new LemmaStore(config);

      lemmaStore.initClient();
      lemmaStore.load(err => {
        if (err) {
          throw err;
        }

        lemmaStore.get('abraimis', (err, value) => {
          assert(value == 'abair', UNEXPECTED_VALUE);
          
          done();
        });
      });
    });
  });
});
