'use strict';

const parserEvents = {
  TOKENS_RAW: 0,
  TOKENS_TYPED: 1,
  LEMMAS: 2,
  POS: 3,
  LAYOUT: 4,
  INACCESSIBLE: 13
};

const coreRules = {
  lex: 0,
  punctuation: 1,
  lemmatization: 2
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
  UNSUPPORTED_PARSE_EVENT: 'Unsupported parse event type'
};

const namespaces = {
  LEX: 'lex',
  LEMMAS: 'LEMMAS',
  LEMMATIZATION: 'lemmatization',
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
const LEMMATIZATION_LISTS_DIR = 'lemmatization-lists';
const LEMMAS_LOADED_KEY = '__loaded__';
const LEMMAS_SEPARATOR = ' ';

const constants = {
  coreRules: coreRules,
  enclosingPunctuation: enclosingPunctuation,
  linkingPunctuation: linkingPunctuation,
  messages: messages,
  namespaces: namespaces,
  ordinaryPunctuation: ordinaryPunctuation,
  parserEvents: parserEvents,
  punctuationTypes: punctuationTypes,
  supportedLanguages: supportedLanguages,
  whitespace: whitespace,
  BASE_LEX_REGEX: BASE_LEX_REGEX,
  LEMMAS_LOADED_KEY: LEMMAS_LOADED_KEY,
  LEMMAS_SEPARATOR: LEMMAS_SEPARATOR,
  LEMMATIZATION_LISTS_DIR: LEMMATIZATION_LISTS_DIR
}

module.exports = constants;
