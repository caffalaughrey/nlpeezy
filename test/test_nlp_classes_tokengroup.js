'use strict';

const assert = require('assert');
const parserEvents = require('../src/nlp/constants').parserEvents;
const rules = require('../src/nlp/rules/index');

const BeginLineToken = require('../src/nlp/classes/BeginLineToken');
const LexicalToken = require('../src/nlp/classes/LexicalToken');
const OrdinaryPunctuationToken =
  require('../src/nlp/classes/OrdinaryPunctuationToken');
const SpaceToken = require('../src/nlp/classes/SpaceToken');
const TokenGroup = require('../src/nlp/classes/TokenGroup');
const UnprocessedToken = require('../src/nlp/classes/UnprocessedToken');

const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const UNEXPECTED_LENGTH = 'Unexpected length.';
const UNEXPECTED_TOKEN = 'Unexpected token type.';
const UNEXPECTED_VALUE = 'Unexpected value.';

describe('/nlp/classes/TokenGroup', () => {
	describe('#TokenGroup', () => {
    it('knows its parsed tokens in raw eventType', done => {
      let raw = BASIC_SAMPLE;
      let tokenGroup = new TokenGroup();

      tokenGroup.setRaw(raw);
      tokenGroup.parse(parserEvents.TOKENS_RAW, rules);

      let tokens = tokenGroup.children;

      assert(tokens[0] instanceof BeginLineToken, UNEXPECTED_TOKEN);
      assert(tokens[1] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[1].value == 'Maraithe', UNEXPECTED_VALUE);
      assert(tokens[2] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[3] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[3].value == 'le', UNEXPECTED_VALUE);
      assert(tokens[4] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[5] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[5].value == 'tae', UNEXPECTED_VALUE);
      assert(tokens[6] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[7] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[7].value == 'is', UNEXPECTED_VALUE);
      assert(tokens[8] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[9] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[9].value == 'maraithe', UNEXPECTED_VALUE);
      assert(tokens[10] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[11] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[11].value == 'gan', UNEXPECTED_VALUE);
      assert(tokens[12] instanceof SpaceToken, UNEXPECTED_TOKEN);
      assert(tokens[13] instanceof UnprocessedToken, UNEXPECTED_TOKEN);
      assert(tokens[13].value == 'é.', UNEXPECTED_VALUE);
      assert(tokens.length == 14, UNEXPECTED_LENGTH + ' ' + tokens.length);
      done();
    });

		it('knows its parsed tokens in typed eventType', done => {
			let raw = BASIC_SAMPLE;
      let tokenGroup = new TokenGroup();

      tokenGroup.setRaw(raw);
      tokenGroup.parse(parserEvents.TOKENS_RAW, rules);
			tokenGroup.parse(parserEvents.TOKENS_TYPED, rules);

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
  });
});
