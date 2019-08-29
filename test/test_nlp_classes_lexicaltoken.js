'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;
const parserEvents = require('../src/nlp/constants').parserEvents;
const rules = require('../src/nlp/rules/index');

const LexicalToken = require('../src/nlp/classes/LexicalToken');

const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const UNEXPECTED_TYPE = messages.UNEXPECTED_TYPE;
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;
const UNSUPPORTED_PARSE_EVENT = messages.UNSUPPORTED_PARSE_EVENT;

describe('/nlp/classes/UnprocessedToken', () => {
	describe('#parse', () => {
    it('handles an error for unsupported parse eventType', done => {
      let eventType = parserEvents.INACCESSIBLE;
      let token = new LexicalToken(BASIC_SAMPLE);

      try {
        token.parse(eventType, rules);
      } catch(err) {
        let message = `${UNSUPPORTED_PARSE_EVENT}: ${eventType}`;

        assert(err.message == message, UNEXPECTED_VALUE);
        assert(err.name == 'LexicalTokenError', UNEXPECTED_TYPE);
      } finally {
        done();
      }
    });
  });
});
