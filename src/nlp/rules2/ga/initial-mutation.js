'use strict';

const LexicalToken = require('../../classes/LexicalToken');

const constants = require('../../constants');
const namespaces = constants.namespaces;
const parsePhases = constants.parsePhases;

const HAS_ECLIPSIS = 'hasEclipsis';
const HAS_LENITION = 'hasLenition';
const HAS_MUTATION = 'hasMutation';
const SEIMHIU_REGEX = '^((b|c|d|f|g|m|p|s|t)h|ts)';
const URU_REGEX = '^(gc|nd|bhf|ng|bp|dt)';

let testRegex = (mutRegex, value) => new RegExp(mutRegex, 'g').test(value);

function applyTo(token, phase) {
  if (phase == parsePhases.LINEAR) {
    let lexTokens = token.getInfo(namespaces.LEX) || [];

    lexTokens.forEach(child => {
      let value = child.getValue();
      let hasEclipsis = false;
      let hasLenition = false;

      switch (true) {
        case testRegex(URU_REGEX, value):
          hasEclipsis = true;
          break;
        case testRegex(SEIMHIU_REGEX, value):
          hasLenition = true;
          break;
      }

      child.setInfo(HAS_ECLIPSIS, hasEclipsis);
      child.setInfo(HAS_LENITION, hasLenition);
      child.setInfo(HAS_MUTATION, hasEclipsis || hasLenition);
    });
  }
}

module.exports = {
  applyTo: applyTo,
  namespace: 'initial-mutation',
  HAS_ECLIPSIS: HAS_ECLIPSIS,
  HAS_LENITION: HAS_LENITION,
  HAS_MUTATION: HAS_MUTATION
};
