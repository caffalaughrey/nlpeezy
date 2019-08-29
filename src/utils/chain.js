'use strict';

const constants = require('../nlp/constants');
const errors = require('./errors');
const messages = constants.messages;

const EMPTY_ARRAY = messages.EMPTY_ARRAY;
const UNKNOWN_STATE = messages.UNKNOWN_STATE;

const Promise = require('bluebird');
const TypedError = errors.TypedError;

class ChainError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'ChainError';
  }
}

module.exports = (arr, callback) => {
  let index = 0;

  return new Promise((resolve, reject) => {
    function handleLink() {
      /* istanbul ignore else */
      if (index in arr) {
        let link = arr[index];

        callback(link, function next(err, stop) {
          if (err) {
            return reject(errors.getTypedError(err, ChainError));
          } else if (stop === true) {
            return resolve(arr);
          } else {
            index++;

            return setTimeout(() => handleLink());
          }
        });
      } else if (index == arr.length) {
        return resolve(arr);
      } else {
        return reject(new ChainError(UNKNOWN_STATE)); // Should be redundant, but leaving for safety.
      }
    }

    if (arr.length < 1) {
      return reject(new ChainError(EMPTY_ARRAY));
    } else {
      handleLink();
    }
  });
};
