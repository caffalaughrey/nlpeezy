'use strict';

const parsePhases = {
  PREP: 0,
  LINEAR: 1,
  LAYOUT: 2,
  INACCESSIBLE: 13
};

const coreRules = {
  lex: 0,
  punctuation: 1
}

const enclosingPunctuation = {
  // SINGLE_QUOTE: '\'', // TODO: Must deal with this separately when layout is
  // parsed. Rules needed to resolve apostrophe v. single quote.
  DOUBLE_QUOTE: '"',
  ROUND_BRACKET_LEFT: '\\(',
  ROUND_BRACKET_RIGHT: '\\)',
  SQUARE_BRACKET_LEFT: '\\[',
  SQUARE_BRACKET_RIGHT: '\\]'
};

const linkingPunctuation = {
  APOSTROPHE: '\'',
  HYPHEN: '\\-'
};

const messages = {
  EMPTY_ARRAY: 'Array must contain at least one element',
  INVALID_LENGTH: 'Wrong length.',
  INVALID_MODULE: 'Wrong module.',
  INVALID_PUNCTUATION_TYPE: 'Invalid punctuation type.',
  INVALID_STATE: 'FATAL: Invalid state.',
  INVALID_TYPE: 'Wrong type.',
  INVALID_VALUE: 'Wrong value.',
  NON_STRING_VALUE: 'Non-string value.',
  UNKNOWN_STATE: 'Unknown state',
  UNSUPPORTED_PARSE_PHASE: 'Unsupported parse phase'
};

const namespaces = {
  LEX: 'lex',
  PUNCTUATION: 'punctuation'
}

const ordinaryPunctuation = {
  COMMA: '\\,',
  EXCLAMATION_MARK: '\\!',
  FULL_STOP: '\\.',
  QUESTION_MARK: '\\?',
  SEMICOLON: ';'
};

const punctuationTypes = {
  ENCLOSING: 1,
  LINKING: 2,
  ORDINARY: 3
};

const supportedLanguages = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  IRISH: 'ga',
  SPANISH: 'es',
  UNKNOWN: 'unknown'
}

const whitespace = {
  RETURN: '\n',
  SPACE: ' '
};

const BASE_LEX_REGEX = 'A-zÀ-ú';

const constants = {
  coreRules: coreRules,
  enclosingPunctuation: enclosingPunctuation,
  linkingPunctuation: linkingPunctuation,
  messages: messages,
  namespaces: namespaces,
  ordinaryPunctuation: ordinaryPunctuation,
  parsePhases: parsePhases,
  punctuationTypes: punctuationTypes,
  supportedLanguages: supportedLanguages,
  whitespace: whitespace,
  BASE_LEX_REGEX: BASE_LEX_REGEX
}

module.exports = constants;
