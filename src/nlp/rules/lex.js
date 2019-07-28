'use strict';

const UnprocessedToken = require('../classes/UnprocessedToken');
const EnclosingPunctuationToken =
  require('../classes/EnclosingPunctuationToken');
const LexicalToken =
    require('../classes/LexicalToken');
const OrdinaryPunctuationToken = require('../classes/OrdinaryPunctuationToken');

const constants = require('../constants');
const errors = require('../../utils/errors');
const linkingPunctuation = constants.linkingPunctuation;
const namespaces = constants.namespaces;
const parsePhases = constants.parsePhases;
const punctFilterFn = (child, level) =>
  (child instanceof EnclosingPunctuationToken ||
  child instanceof OrdinaryPunctuationToken) && level == 1 ?
    child.getValue() : undefined;

const BASE_LEX_REGEX = constants.BASE_LEX_REGEX;

const TypedError = errors.TypedError;
class LexRuleError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'LexRuleError';
  }
}

function getLexRegex(language) {
  // Generate a regular expression like so: ^[A-zÀ-ú\-\']*
  // * A-zÀ-ú are 'base' ranges
  // * \\-\\' generated from linking punctuation
  // * Additional ranges can be added for extended, language-specific character
  //   support (eg. diacritical marks, etc.)
  let linkingPunct = Object.values(linkingPunctuation).join('');
  let extendedRanges = ''; // TODO: Gather this from token
  let lexRegex = `^[${BASE_LEX_REGEX}${extendedRanges}${linkingPunct}]*$`;

  return new RegExp(lexRegex, 'g');
}

function getSplitRegex(splittableChars) {
  let safe = char =>
    ['\\', '^', '$', '.', '|', '?', '*', '+', ')', '(', ',', '!', ']', '[']
      .includes(char) ? `\\${char}` : char;
  let splitRegex = [];

  splittableChars.forEach(char => splitRegex.push(safe(char)));

  return new RegExp(splitRegex.join('|'), 'g');
}

function makeToken(tokens, value, parent, fromSplit) {
  let language = parent.getLanguage();
  let originalValue = parent.getValue();
  let lexRegex = getLexRegex(language);
  let lexTokens = parent.getInfo(namespaces.LEX);
  let isLexical = lexRegex.test(value);
  let newToken;

  if (!lexTokens) {
    lexTokens = [];

    parent.setInfo(namespaces.LEX, lexTokens);
  }

  if (isLexical && value != '') {
    newToken = new LexicalToken(value);

    lexTokens.push(newToken);
  } else if (!isLexical && !fromSplit) {
    newToken = new UnprocessedToken(value);
  }

  if (newToken) {
    newToken.index = originalValue.indexOf(value);
    newToken.parent = parent;

    tokens.push(newToken);
  }
}

function punctResolverFn() {
  return this.getInfo(namespaces.PUNCTUATION) || [];
}

function applyTo(token, phase, callback) {
  let tokens = [];
  let punctuationTokens = token.getInfo(namespaces.PUNCTUATION) || [];
  let originalValue = token.getValue();

  if (phase == parsePhases.LINEAR) {
    if (punctuationTokens.length > 0) {
      token.filterMap(punctFilterFn, punctResolverFn).then(splittableChars => {
        let err;
        let unique = (char, index) => splittableChars.indexOf(char) >= index;

        try {
          splittableChars = splittableChars.filter(unique);

          let splitRegex = getSplitRegex(splittableChars);
          let newValues = originalValue.split(splitRegex);

          newValues.forEach(value => makeToken(tokens, value, token, true));
        } catch (e) {
          err = errors.getTypedError(e, LexRuleError);
        } finally {
          return callback(err, tokens);
        }
      }).catch(err => callback(err, null));
    } else {
      makeToken(tokens, originalValue, token, false);

      return callback(null, tokens);
    }
  }
}

module.exports = {
  applyTo: applyTo,
  namespace: namespaces.LEX
};
