'use strict';

const constants = require('../nlp/constants');
const errors = require('./errors');
const messages = constants.messages;
const supportedLanguages = constants.supportedLanguages;

const TypedError = errors.TypedError;

const UNSUPPORTED_LANGUAGE = messages.UNSUPPORTED_LANGUAGE;

class LanguageSupportError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'LanguageSupportError';
  }
}

class LanguageSupport {
  constructor() {
    this.language = null;
  }

  getLanguage() {
    if (this.parent) {
      return this.parent.getLanguage();
    }

    if (this.language == null) {
      this.language = supportedLanguages.UNKNOWN;
    }

    return this.language;
  }

  setLanguage(language) {
    if (!Object.values(supportedLanguages).includes(language)) {
      throw new LanguageSupportError(`${UNSUPPORTED_LANGUAGE}: ${language}`);
    }

    this.language = language;
  }
}

module.exports = {
  LanguageSupport: LanguageSupport,
  LanguageSupportError: LanguageSupportError
};
