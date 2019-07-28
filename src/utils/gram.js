'use strict';

class Gram {
  constructor() {
    this.gramInfo = {};
  }

  accessGram(namespace, callback) {
    let gramInfo = this.getGramInfo(namespace);
    let allGrams = gramInfo.allGrams;
    let ownIndex = gramInfo.ownIndex;
    let previous = ownIndex - 1 in allGrams ? allGrams[ownIndex - 1] : null;
    let next = ownIndex + 1 in allGrams ? allGrams[ownIndex + 1] : null;

    callback.apply(this, [previous, next, gramInfo]);
  }

  getGramInfo(namespace) {
    return this.gramInfo[namespace];
  }

  setGramInfo(namespace, grams, ownIndex) {
    this.gramInfo[namespace] = {
      allGrams: grams,
      namespace: namespace,
      ownIndex: ownIndex
    };
  }
}

let composeGrams = (namespace, ...grams) =>
  grams.forEach((gram, index) => gram.setGramInfo(namespace, grams, index));

module.exports = {
  Gram: Gram,
  composeGrams: composeGrams
}
