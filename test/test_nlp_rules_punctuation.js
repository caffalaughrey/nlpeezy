'use strict';
const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;
const parserEvents = constants.parserEvents;
const punctuation = require('../src/nlp/rules/punctuation');

const INVALID_TYPE = messages.INVALID_TYPE;
const INVALID_VALUE = messages.INVALID_VALUE;

const EnclosingPunctuationToken =
  require('../src/nlp/classes/EnclosingPunctuationToken');
const LinkingPunctuationToken =
    require('../src/nlp/classes/LinkingPunctuationToken');
const OrdinaryPunctuationToken =
    require('../src/nlp/classes/OrdinaryPunctuationToken');
const UnprocessedToken = require('../src/nlp/classes/UnprocessedToken');

describe('/nlp/rules/punctuation', () => {
	describe('#applyTo()', () => {
    it('knows elements for enclosing punctuation during typed token eventType', done => {
      let parent = new UnprocessedToken('(lúibíní)');
      let tokens = punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);

      assert(tokens[0] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[0].index == 0, INVALID_VALUE);
      assert(tokens[0].getValue() == '(', INVALID_VALUE);
      assert(tokens[1] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[1].index == 8, INVALID_VALUE);
      assert(tokens[1].getValue() == ')', INVALID_VALUE);
      done();
    });

    it('knows elements for linking punctuation during typed token eventType', done => {
      let parent = new UnprocessedToken('m\'uaschamóg');
      let tokens = punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);

      assert(tokens[0] instanceof LinkingPunctuationToken, INVALID_TYPE);
      assert(tokens[0].index == 1, INVALID_VALUE);
      assert(tokens[0].getValue() == '\'', INVALID_VALUE);
      done();
    });

    it('knows elements for ordinary punctuation during typed token eventType', done => {
      let parent = new UnprocessedToken('camóg,');
      let tokens = punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);

      assert(tokens[0] instanceof OrdinaryPunctuationToken, INVALID_TYPE);
      assert(tokens[0].index == 5, INVALID_VALUE);
      assert(tokens[0].getValue() == ',', INVALID_VALUE);
      done();
    });

    it('knows elements for mixed punctuation during typed token eventType', done => {
      let parent = new UnprocessedToken('(ró-ólta!)');
      let newTokens = punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);

      parent.children = parent.children.concat(newTokens);
      parent.sort();

      let tokens = parent.children;

      assert(tokens[0] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[0].index == 0, INVALID_VALUE);
      assert(tokens[0].getValue() == '(', INVALID_VALUE);
      assert(tokens[1] instanceof LinkingPunctuationToken, INVALID_TYPE);
      assert(tokens[1].index == 3, INVALID_VALUE);
      assert(tokens[1].getValue() == '-', INVALID_VALUE);
      assert(tokens[2] instanceof OrdinaryPunctuationToken, INVALID_TYPE);
      assert(tokens[2].index == 8, INVALID_VALUE);
      assert(tokens[2].getValue() == '!', INVALID_VALUE);
      assert(tokens[3] instanceof EnclosingPunctuationToken, INVALID_TYPE);
      assert(tokens[3].index == 9, INVALID_VALUE);
      assert(tokens[3].getValue() == ')', INVALID_VALUE);
      done();
    });

    it('knows an error for bad data', done => {
      let parent = new UnprocessedToken({});

      try {
        punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);
      } catch(err) {
        assert(err.message == 'Non-string value.', INVALID_VALUE);
      } finally {
        done();
      }
    });

    it('knows to leave an apostrophe unprocessed', done => {
      let parent = new UnprocessedToken("'");
      let tokens = punctuation.applyTo(parent, parserEvents.TOKENS_TYPED);

      assert(tokens[0] instanceof UnprocessedToken, INVALID_VALUE);
      assert(tokens[0].index == 0, INVALID_VALUE);
      done();
    });
  });
});
