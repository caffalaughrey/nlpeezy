'use strict';

const assert = require('assert');
const chain = require('../src/utils/chain');
const constants = require('../src/nlp/constants');
const lex = require('../src/nlp/rules/lex');
const messages = constants.messages;
const parserEvents = constants.parserEvents;
const punctuation = require('../src/nlp/rules/punctuation');

const INVALID_TYPE = messages.INVALID_TYPE;
const INVALID_VALUE = messages.INVALID_VALUE;

const EnclosingPunctuationToken =
  require('../src/nlp/classes/EnclosingPunctuationToken');
const LexicalToken = require('../src/nlp/classes/LexicalToken');
const LinkingPunctuationToken =
    require('../src/nlp/classes/LinkingPunctuationToken');
const OrdinaryPunctuationToken =
    require('../src/nlp/classes/OrdinaryPunctuationToken');
const UnprocessedToken = require('../src/nlp/classes/UnprocessedToken');

describe('/nlp/rules/lex', () => {
	describe('#applyTo()', () => {
    it('knows a lexical token between brackets', done => {
      let parent = new UnprocessedToken('(lúibíní)');

      [punctuation, lex].forEach(rule => {
        parent.children = parent.children.concat(
          rule.applyTo(parent, parserEvents.TOKENS_TYPED));
        parent.sort();
      });

      let tokens = parent.children;

      assert(tokens[0] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[0].index == 0, INVALID_VALUE);
      assert(tokens[0].getValue() == '(', INVALID_VALUE);
      assert(tokens[1] instanceof LexicalToken, INVALID_TYPE);
      assert(tokens[1].index == 1, INVALID_VALUE);
      assert(tokens[1].getValue() == 'lúibíní', INVALID_VALUE);
      assert(tokens[2] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[2].index == 8, INVALID_VALUE);
      assert(tokens[2].getValue() == ')', INVALID_VALUE);
      done();
    });

    it('knows an unprocessed token from non-lexical data', done => {
      let token = new UnprocessedToken('1+1=2');
      let tokens = lex.applyTo(token, parserEvents.TOKENS_TYPED);

      assert(tokens[0] instanceof UnprocessedToken, INVALID_VALUE);
      assert(tokens[0].index == 0, INVALID_VALUE);

      done();
    });

    it('knows an error from hot-swapped punctuation data', done => {
      let token = new UnprocessedToken('earráid!');

      token.setInfo(punctuation.namespace, [new OrdinaryPunctuationToken('!')]);
      token.setInfo(lex.namespace, {}); // Bad data

      try {
        lex.applyTo(token, parserEvents.TOKENS_TYPED);
        done();
      } catch (err) {
        assert(err.name == 'LexRuleError', INVALID_TYPE);
        assert(err.message == 'lexTokens.push is not a function',
          INVALID_VALUE);
      } finally {
        done();
      }
    });
  });
});
