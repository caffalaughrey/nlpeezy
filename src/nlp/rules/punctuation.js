'use strict';

const EnclosingPunctuationToken =
  require('../classes/EnclosingPunctuationToken');
const LinkingPunctuationToken = require('../classes/LinkingPunctuationToken');
const OrdinaryPunctuationToken = require('../classes/OrdinaryPunctuationToken');

const constants = require('../constants');
const namespaces = constants.namespaces;
const parsePhases = constants.parsePhases;
const punctuationTypes = constants.punctuationTypes;

const ENCLOSING_PUNCTUATION = constants.enclosingPunctuation;
const LINKING_PUNCTUATION = constants.linkingPunctuation;
const NAMESPACE = 'punctuation';
const ORDINARY_PUNCTUATION = constants.ordinaryPunctuation;
const INVALID_STATE = constants.messages.INVALID_STATE;
const APOSTROPHE = LINKING_PUNCTUATION.APOSTROPHE

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

function applyTo(token, phase, callback) {
  let err;
  let tokens = [];
  let concat = newTokens => tokens = tokens.concat(newTokens);

  if (phase == parsePhases.LINEAR) {
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
      err = e;
    } finally {
      return callback(err, tokens)
    }
  }
}

module.exports = {
  applyTo: applyTo,
  namespace: namespaces.PUNCTUATION
}
