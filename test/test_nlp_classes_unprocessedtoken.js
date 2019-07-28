'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;
const parsePhases = require('../src/nlp/constants').parsePhases;
const rules2 = require('../src/nlp/rules2/index');

const BeginLineToken = require('../src/nlp/classes/BeginLineToken');
const LexicalToken = require('../src/nlp/classes/LexicalToken');
const OrdinaryPunctuationToken =
  require('../src/nlp/classes/OrdinaryPunctuationToken');
const SpaceToken = require('../src/nlp/classes/SpaceToken');
const TokenGroup = require('../src/nlp/classes/TokenGroup');
const UnprocessedToken = require('../src/nlp/classes/UnprocessedToken');

const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const UNEXPECTED_LENGTH = messages.UNEXPECTED_LENGTH;
const UNEXPECTED_TOKEN = messages.UNEXPECTED_TOKEN;
const UNEXPECTED_TYPE = messages.UNEXPECTED_TYPE;
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;
const UNSUPPORTED_PARSE_PHASE = messages.UNSUPPORTED_PARSE_PHASE;

describe('/nlp/classes/UnprocessedToken', () => {
	describe('#parse', () => {
    it('knows its parsed tokens in linear phase', done => {
      let raw = BASIC_SAMPLE;
      let tokenGroup = new TokenGroup();

      tokenGroup.setRaw(raw);
      tokenGroup.parse(parsePhases.PREP, rules2);

      tokenGroup.children.forEach(token => {
        if (token instanceof UnprocessedToken) {
          let parsed = token.parse(parsePhases.LINEAR, rules2);

          token.children = parsed;
        }
      });

      tokenGroup.unwind(UnprocessedToken, (child, oldParent) => {
        if (oldParent && child.index !== null && oldParent.index !== null) {
          child.index = child.index + oldParent.index;
        }
      });

      let tokens = tokenGroup.children;

      assert(tokens[0] instanceof BeginLineToken, UNEXPECTED_TOKEN);
      assert(tokens[1] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[1].value == 'Maraithe', UNEXPECTED_VALUE);
      assert(tokens[1].index == 0, UNEXPECTED_VALUE);
      assert(tokens[2] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[2].index == 8, UNEXPECTED_VALUE);
      assert(tokens[3] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[3].value == 'le', UNEXPECTED_VALUE);
      assert(tokens[3].index == 9, UNEXPECTED_VALUE);
      assert(tokens[4] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[4].index == 11, UNEXPECTED_VALUE);
      assert(tokens[5] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[5].value == 'tae', UNEXPECTED_VALUE);
      assert(tokens[5].index == 12, UNEXPECTED_VALUE);
      assert(tokens[6] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[6].index == 15, UNEXPECTED_VALUE);
      assert(tokens[7] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[7].value == 'is', UNEXPECTED_VALUE);
      assert(tokens[7].index == 16, UNEXPECTED_VALUE);
      assert(tokens[8] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[8].index == 18, UNEXPECTED_VALUE);
      assert(tokens[9] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[9].value == 'maraithe', UNEXPECTED_VALUE);
      assert(tokens[9].index == 19, UNEXPECTED_VALUE);
      assert(tokens[10] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[10].index == 27, UNEXPECTED_VALUE);
      assert(tokens[11] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[11].value == 'gan', UNEXPECTED_VALUE);
      assert(tokens[11].index == 28, UNEXPECTED_VALUE);
      assert(tokens[12] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[12].index == 31, UNEXPECTED_VALUE);
      assert(tokens[13] instanceof LexicalToken, UNEXPECTED_TOKEN);
      assert(tokens[13].value == 'é', UNEXPECTED_VALUE);
      assert(tokens[13].index == 32, UNEXPECTED_VALUE);
      assert(tokens[14] instanceof OrdinaryPunctuationToken,
          UNEXPECTED_TOKEN);
      assert(tokens[14].value == '.', UNEXPECTED_VALUE);
      assert(tokens[14].index == 33, UNEXPECTED_VALUE);
      assert(tokens.length == 15,
        UNEXPECTED_LENGTH + ' ' + tokens.length);
      done();
    });

    it('handles an error for unsupported parse phase', done => {
      let phase = parsePhases.INACCESSIBLE;
      let token = new UnprocessedToken(BASIC_SAMPLE);

      try {
        token.parse(phase, rules2);
      } catch(err) {
        let message = `${UNSUPPORTED_PARSE_PHASE}: ${phase}`;

        assert(err.message == message, UNEXPECTED_VALUE);
        assert(err.name == 'UnprocessedTokenError', UNEXPECTED_TYPE);
      } finally {
        done();
      }
    });
  });
});
