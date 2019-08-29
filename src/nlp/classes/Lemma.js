'use strict';

const levenshteinDistance = require('../../utils/levenshtein-distance');

const LEMMAS_SEPARATOR = ' ';

class Lemma {
  constructor(token, value) {
    this.value = value || '';

    this.setToken(token);
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
  }

  getProbableValue() {
    let values = this.getValues();
    let tokenValue = this.getToken().getValue();
    let shortestDistance = 0, shortestIndex = null;

    values.forEach((value, index) => {
      let distance = levenshteinDistance(tokenValue, value);

      if (shortestIndex == null || distance < shortestDistance) {
        shortestDistance = distance;
        shortestIndex = index;
      }
    });

    if (shortestIndex == null) {
      /* istanbul ignore next */
      return null;
    }

    return values[shortestIndex];
  }

  getValues() {
    return this.value.split(LEMMAS_SEPARATOR);
  }
}

module.exports = Lemma;
