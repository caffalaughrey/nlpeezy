'use strict';

const classes = require('extends-classes');
const constants = require('../constants');
const errors = require('../../utils/errors');
const messages = constants.messages;
const punctuationTypes = constants.punctuationTypes;

const Gram = require('../../utils/gram').Gram;
const LanguageSupport = require('../../utils/language').LanguageSupport;
const Tree = require('../../utils/tree').Tree;
const TypedError = errors.TypedError;

const HAS_ENCLOSING_PUNCT_REGEX = '[\\(\\)\\[\\]"]';
const HAS_LINKING_PUNCT_REGEX = '[\\-\']';
const HAS_ORDINARY_PUNCT_REGEX = '[\\.\\,\\!\\?\\:;]';
const NON_STRING_VALUE = messages.NON_STRING_VALUE;
const INVALID_PUNCTUATION_TYPE = messages.INVALID_PUNCTUATION_TYPE;

class BaseTokenError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'BaseTokenError';
  }
}

class Token extends classes(Gram, LanguageSupport, Tree) {
  constructor(value) {
    super();

    this.index = null;
    this.info = {};
    this.parent = null;
    this.value = value;
    this.lemma = null;
  }

  hasPunctuation(type) {
    let hasPunctuation = null;
    let testRegex = (punctRegex, value) =>
      new RegExp(punctRegex, 'g').test(value);

    if (!this.isString()) {
      throw new BaseTokenError(NON_STRING_VALUE);
    }

    switch(type) {
      case punctuationTypes.ENCLOSING:
        hasPunctuation = testRegex(HAS_ENCLOSING_PUNCT_REGEX, this.value);
        break;
      case punctuationTypes.LINKING:
        hasPunctuation = testRegex(HAS_LINKING_PUNCT_REGEX, this.value);
        break;
      case punctuationTypes.ORDINARY:
        hasPunctuation = testRegex(HAS_ORDINARY_PUNCT_REGEX, this.value);
        break;
      default:
        throw new BaseTokenError(INVALID_PUNCTUATION_TYPE);
    }

    return hasPunctuation;
  }

  getValue() {
    return this.value;
  }

  getInfo(key) {
    return this.info[key];
  }

  getLemma() {
    return this.lemma;
  }

  isString() {
    return typeof this.value == 'string';
  }

  setInfo(key, value) {
    this.info[key] = value;
  }

  setLemma(lemma) {
    this.lemma = lemma;
  }

  sort() {
    this.children.sort((a, b) =>
      a.index > b.index ? 1 : a.index < b.index ? -1 : 0);
  }
};

module.exports = Token;
