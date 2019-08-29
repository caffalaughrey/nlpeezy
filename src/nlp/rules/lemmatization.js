'use strict';

const Lemma = require('../classes/Lemma');
const LexicalToken = require('../classes/LexicalToken');
const UnprocessedToken = require('../classes/UnprocessedToken');

const constants = require('../constants');
const namespaces = constants.namespaces;
const parserEvents = constants.parserEvents;

function applyTo(token, eventType) {
  if (eventType == parserEvents.LEMMAS) {
    let tokenGroup = token.parent;
    let lemmasMap = tokenGroup.lemmasMap || {};
    let tokenValue = token.getValue().toLowerCase();

    if (tokenValue in lemmasMap) {
      let lemma = new Lemma(token, lemmasMap[tokenValue]);

      token.setLemma(lemma);
    }
  }
  return [];
}

module.exports = {
  applyTo: applyTo,
  namespace: namespaces.LEMMATIZATION
};
