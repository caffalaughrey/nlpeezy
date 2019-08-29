'use strict';

const EnclosingPunctuationToken =
  require('../classes/EnclosingPunctuationToken');
const LinkingPunctuationToken = require('../classes/LinkingPunctuationToken');
const OrdinaryPunctuationToken = require('../classes/OrdinaryPunctuationToken');
const UnprocessedToken = require('../classes/UnprocessedToken');

const constants = require('../constants');
const errors = require('../../utils/errors');
const namespaces = constants.namespaces;
const parserEvents = constants.parserEvents;
const punctuationTypes = constants.punctuationTypes;

const ENCLOSING_PUNCTUATION = constants.enclosingPunctuation;
const LINKING_PUNCTUATION = constants.linkingPunctuation;
const NAMESPACE = namespaces.PUNCTUATION;
const ORDINARY_PUNCTUATION = constants.ordinaryPunctuation;
const INVALID_STATE = constants.messages.INVALID_STATE;
const APOSTROPHE = LINKING_PUNCTUATION.APOSTROPHE;

const TypedError = errors.TypedError;
class PunctuationError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'PunctuationError';
  }
}

function getPunctuationTokens(parent, type) {
  let group;
  let punctMap = {};
  let value = parent.getValue();
  let tokens = [];

  switch (type) {
    case EnclosingPunctuationToken:
      punctMap = ENCLOSING_PUNCTUATION;
      break;
    case LinkingPunctuationToken:
      punctMap = LINKING_PUNCTUATION;
      break;
    case OrdinaryPunctuationToken:
      punctMap = ORDINARY_PUNCTUATION;
      break;
    /* istanbul ignore next */
    default:
      throw INVALID_STATE; // Should be unreachable, but just in case.
  }

  let punctRegex = new RegExp(`(${Object.values(punctMap).join('|')})`, 'g');

  while ((group = punctRegex.exec(value)) !== null) {
    let newTokenValue = group[0];
    let newToken;
    let index = group.index;

    if (type == LinkingPunctuationToken) {
      let isOnBoundary = index == 0 || index == value.length - 1;

      switch (true) {
        case newTokenValue == APOSTROPHE && isOnBoundary:
          // If there is a potential apostrophe occurring on a word boundary, we
          // aren't ready to deal with it yet, because it might be a single
          // quotation. We create an unprocessed token out of it instead.
          newToken = new UnprocessedToken(newTokenValue);
          break;
        default:
          newToken = new type(newTokenValue);
      }
    } else {
      newToken = new type(newTokenValue);
    }

    newToken.index = group.index;
    newToken.parent = parent;

    tokens.push(newToken);
  }

  return tokens;
}

function applyTo(token, eventType) {
  let tokens = [];
  let concat = newTokens => tokens = tokens.concat(newTokens);

  if (eventType == parserEvents.TOKENS_TYPED) {
    try {
      if (token.hasPunctuation(punctuationTypes.ENCLOSING)) {
        concat(getPunctuationTokens(token, EnclosingPunctuationToken));
      }

      if (token.hasPunctuation(punctuationTypes.LINKING)) {
        concat(getPunctuationTokens(token, LinkingPunctuationToken));
      }

      if (token.hasPunctuation(punctuationTypes.ORDINARY)) {
        concat(getPunctuationTokens(token, OrdinaryPunctuationToken));
      }

      token.setInfo(namespaces.PUNCTUATION, tokens);
    } catch(e) {
      throw errors.getTypedError(e, PunctuationError);
    }
  }

  return tokens;
}

module.exports = {
  applyTo: applyTo,
  namespace: namespaces.PUNCTUATION
};
