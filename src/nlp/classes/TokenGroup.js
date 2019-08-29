'use strict';

const classes = require('extends-classes');
const composeGrams = require('../../utils/gram').composeGrams;
const constants = require('../constants');
const parserEvents = constants.parserEvents;
const punctuation = constants.punctuation;
const whitespace = constants.whitespace;

const BeginLineToken = require('./BeginLineToken');
const LanguageSupport = require('../../utils/language').LanguageSupport;
const LexicalToken = require('./LexicalToken');
const SpaceToken = require('./SpaceToken');
const Token = require('./Token');
const Tree = require('../../utils/tree').Tree;
const UnprocessedToken = require('./UnprocessedToken');

function tokensRaw(rules){
  let raw = this.raw;
  let unprocessedRaw = raw.split(whitespace.SPACE);
  let unprocessed = [];

  this.children = [];

  let tokens = this.children;
  let counted = 0;

  unprocessedRaw.forEach((value, index) => {
    if (index == 0) {
      let beginLineToken = new BeginLineToken();

      beginLineToken.index = 0;
      beginLineToken.parent = this;

      tokens.push(beginLineToken);
    }

    if (value.length > 0) {
      let unprocessedToken = new UnprocessedToken(value);

      unprocessedToken.index = counted;
      unprocessedToken.parent = this;

      tokens.push(unprocessedToken);
      unprocessed.push(unprocessedToken);

      counted += value.length;
    }

    if (index != unprocessedRaw.length - 1) {
      let spaceToken = new SpaceToken(whitespace.SPACE);

      spaceToken.index = counted;
      spaceToken.parent = this;

      tokens.push(spaceToken);

      counted++;
    }
  });

  composeGrams('unprocessed', ...unprocessed);

  this._eventsCompleted[parserEvents.TOKENS_RAW] = null;
}

function tokensTyped(rules) {
  this.children.forEach(token => {
    if (token instanceof UnprocessedToken) {
      let parsed = token.parse(parserEvents.TOKENS_TYPED, rules);

      token.children = parsed;
    }
  });

  this.unwind(UnprocessedToken, (child, oldParent) => {
    if (oldParent && child.index !== null && oldParent.index !== null) {
      child.index = child.index + oldParent.index;
    }
  });

  this._eventsCompleted[parserEvents.TOKENS_TYPED] = null;
}

function lemmas(rules) {
  this.children.forEach(token => {
    if (token instanceof UnprocessedToken || token instanceof LexicalToken) {
      token.parse(parserEvents.LEMMAS, rules);
    }
  });

  this._eventsCompleted[parserEvents.LEMMAS] = null;
}

class TokenGroup extends classes(LanguageSupport, Tree) {
  constructor() {
    super();

    this.index = null;
    this.lemmasMap = {};
    this.raw = null;
    this._eventsCompleted = {};
  }

  allowed(eventType) {
    return !(eventType in this._eventsCompleted) ? eventType : parserEvents.INACCESSIBLE;
  }

  parse(eventType, rules) {
    switch (this.allowed(eventType)) {
      case parserEvents.TOKENS_RAW:
        tokensRaw.apply(this, [rules]);
        break;
      case parserEvents.TOKENS_TYPED:
        tokensTyped.apply(this, [rules]);
        break;
      case parserEvents.LEMMAS:
        lemmas.apply(this, [rules]);
        break;
    }
  }

  setLemmasMap(lemmasMap) {
    this.lemmasMap = lemmasMap || this.lemmasMap;
  }

  setRaw(raw) {
    this.raw = raw;
  }
}

module.exports = TokenGroup;
