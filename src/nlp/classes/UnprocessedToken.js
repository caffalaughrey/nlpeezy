'use strict';

const chain = require('../../utils/chain');
const constants = require('../constants');
const errors = require('../../utils/errors');
const messages = constants.messages;
const parsePhases = constants.parsePhases;

const Token = require('./Token');
const TypedError = errors.TypedError;

const UNSUPPORTED_PARSE_PHASE = messages.UNSUPPORTED_PARSE_PHASE;

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
  parse(phase, rules) {
    let parsed = [];

    switch(phase) {
      case parsePhases.LINEAR:
        parsed = rules.applyTo(this, phase);

        break;
      default:
        let message = `${UNSUPPORTED_PARSE_PHASE}: ${phase}`;
        let err = new UnprocessedTokenError(message);

        throw err;
    }

    return parsed;
  }
}

module.exports = UnprocessedToken;
