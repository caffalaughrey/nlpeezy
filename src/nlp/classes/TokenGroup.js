'use strict';

const classes = require('extends-classes');
const composeGrams = require('../../utils/gram').composeGrams;
const constants = require('../constants');
const parsePhases = constants.parsePhases;
const punctuation = constants.punctuation;
const whitespace = constants.whitespace;

const BeginLineToken = require('./BeginLineToken');
const LanguageSupport = require('../../utils/language').LanguageSupport;
const SpaceToken = require('./SpaceToken');
const Token = require('./Token');
const Tree = require('../../utils/tree2').Tree;
const UnprocessedToken = require('./UnprocessedToken');

function prep(rules){
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

  this._phasesCompleted[parsePhases.PREP] = null;
}

function linear(rules) {
  this.children.forEach(token => {
    if (token instanceof UnprocessedToken) {
      let parsed = token.parse(parsePhases.LINEAR, rules);

      token.children = parsed;
    }
  });

  this.unwind(UnprocessedToken, (child, oldParent) => {
    if (oldParent && child.index !== null && oldParent.index !== null) {
      child.index = child.index + oldParent.index;
    }
  });

  this._phasesCompleted[parsePhases.LINEAR] = null;
}

class TokenGroup extends classes(LanguageSupport, Tree) {
  constructor() {
    super();

    this.index = null;
    this.raw = null;
    this._phasesCompleted = {};
  }

  allowed(phase) {
    return !(phase in this._phasesCompleted) ? phase : parsePhases.INACCESSIBLE;
  }

  parse(phase, rules) {
    switch (this.allowed(phase)) {
      case parsePhases.PREP:
        prep.apply(this, [rules]);
        break;
      case parsePhases.LINEAR:
        linear.apply(this, [rules]);
        break;
    }

  }

  setRaw(raw) {
    this.raw = raw;
  }
}

module.exports = TokenGroup;
