'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const lemmas = require('../src/nlp/lemmas');
const messages = constants.messages;
const nlp = require('../src/index');
const strategies = require('../src/utils/datastores').strategies;
const supportedLanguages = constants.supportedLanguages;

const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const INVALID_LENGTH = messages.INVALID_LENGTH;
const INVALID_TYPE = messages.INVALID_TYPE;
const INVALID_VALUE = messages.INVALID_VALUE;

const BeginLineToken = require('../src/nlp/classes/BeginLineToken');
const LexicalToken = require('../src/nlp/classes/LexicalToken');
const OrdinaryPunctuationToken =
	require('../src/nlp/classes/OrdinaryPunctuationToken');
const SpaceToken = require('../src/nlp/classes/SpaceToken');
const TestReadable = require('stream').Readable;

function assertToken(token, type, index, value, lemmaValue) {
  assert(token instanceof type, INVALID_TYPE);
  assert(token.index == index, INVALID_VALUE);
  assert(token.getValue() == value, INVALID_VALUE);

  if (token.getLemma()) {
    assert(token.getLemma().getProbableValue() == lemmaValue);
  }
}

function assertBasicSample(tokenGroup) {
  let children = tokenGroup.children;

  assertToken(children[0], BeginLineToken, 0, undefined, null);
  assertToken(children[1], LexicalToken, 0, 'Maraithe', 'maraigh');
  assertToken(children[2], SpaceToken, 8, ' ', null);
  assertToken(children[3], LexicalToken, 9, 'le', 'le');
  assertToken(children[4], SpaceToken, 11, ' ', null);
  assertToken(children[5], LexicalToken, 12, 'tae', 'tae');
  assertToken(children[6], SpaceToken, 15, ' ', null);
  assertToken(children[7], LexicalToken, 16, 'is', 'is');
  assertToken(children[8], SpaceToken, 18, ' ', null);
  assertToken(children[9], LexicalToken, 19, 'maraithe', 'maraigh');
  assertToken(children[10], SpaceToken, 27, ' ', null);
  assertToken(children[11], LexicalToken, 28, 'gan', 'gan');
  assertToken(children[12], SpaceToken, 31, ' ', null);
  assertToken(children[13], LexicalToken, 32, 'é', 'é');
  assertToken(children[14], OrdinaryPunctuationToken, 33, '.', null);
}

describe('/nlp/index', () => {
  before(done => {
    let config =
      {language: supportedLanguages.IRISH, strategy: strategies.REDIS};

    lemmas.loadStore(config, _ => done());
  });

	describe('#analyze()', () => {
    it('knows full analyzed results for a string', done => {
      let value = BASIC_SAMPLE;
      let config = {language: supportedLanguages.IRISH};

      nlp.analyze(value, config, (err, tokenGroups) => {
        if (err) throw err;

        assertBasicSample(tokenGroups[0]);

        done();
      });
    });

    it('knows full analyzed results for a read stream', done => {
      let value = new TestReadable();

      value._read = () => {}; // noop
      value.push(BASIC_SAMPLE);
      value.push(null);

      let config = {language: supportedLanguages.IRISH};

      nlp.analyze(value, config, (err, tokenGroups) => {
        if (err) throw err;

        assertBasicSample(tokenGroups[0]);

        done();
      });
    });

    it('knows results for config-less string', done => {
      let value = BASIC_SAMPLE;

      nlp.analyze(value, (err, tokenGroups) => {
        if (err) throw err;

        assertBasicSample(tokenGroups[0]);

        done();
      });
    });

    it('knows not to lemmatise when useLemmatization is false', done => {
      let value = BASIC_SAMPLE;
      let config = {
        language: supportedLanguages.IRISH,
        useLemmatization: false
      };

      nlp.analyze(value, config, (err, tokenGroups) => {
        if (err) throw err;

        assertBasicSample(tokenGroups[0]);

        done();
      });
    });
  });
});
