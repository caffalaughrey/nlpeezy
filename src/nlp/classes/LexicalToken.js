'use strict';

const constants = require('../constants');
const errors = require('../../utils/errors');
const messages = constants.messages;
const parserEvents = constants.parserEvents;

const Token = require('./Token');
const TypedError = errors.TypedError;

const UNSUPPORTED_PARSE_EVENT = messages.UNSUPPORTED_PARSE_EVENT;

class LexicalTokenError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'LexicalTokenError';
  }
}

class LexicalToken extends Token {
  parse(eventType, rules) {
    let parsed = [];

    switch(eventType) {
      case parserEvents.LEMMAS:
        parsed = rules.applyTo(this, eventType);

        break;
      default:
        let message = `${UNSUPPORTED_PARSE_EVENT}: ${eventType}`;
        let err = new LexicalTokenError(message);

        throw err;
    }

    return parsed;
  }
}

module.exports = LexicalToken;
