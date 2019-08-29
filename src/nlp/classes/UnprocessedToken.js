'use strict';

const constants = require('../constants');
const errors = require('../../utils/errors');
const messages = constants.messages;
const parserEvents = constants.parserEvents;

const Token = require('./Token');
const TypedError = errors.TypedError;

const UNSUPPORTED_PARSE_EVENT = messages.UNSUPPORTED_PARSE_EVENT;

class UnprocessedTokenError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'UnprocessedTokenError';
  }
}

/**
  * @desc A placeholder for an unprocessed token.
  */
class UnprocessedToken extends Token {
  parse(eventType, rules) {
    let parsed = [];

    switch(eventType) {
      case parserEvents.TOKENS_TYPED:
        parsed = rules.applyTo(this, eventType);

        break;
      case parserEvents.LEMMATIZATION:
        parsed = rules.applyTo(this, eventType);

        break;
      default:
        let message = `${UNSUPPORTED_PARSE_EVENT}: ${eventType}`;
        let err = new UnprocessedTokenError(message);

        throw err;
    }

    return parsed;
  }
}

module.exports = UnprocessedToken;
