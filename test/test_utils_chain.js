'use strict';

const assert = require('assert');
const chain = require('../src/utils/chain');
const constants = require('../src/nlp/constants');
const errors = require('../src/utils/errors');
const messages = constants.messages;

let EMPTY_ARRAY = messages.EMPTY_ARRAY;
let INVALID_VALUE = messages.INVALID_VALUE;

describe('/utils/chain', () => {
  it('knows how to stop the chain', done => {
    let arr = ['a', 'b', 'c'];
    let stoppedElement;

    chain(arr, (child, next) => {
      if (child == 'b') {
        stoppedElement = child;

        return next(null, true);
      } else {
        return next();
      }
    }).then(_ => {
      assert(stoppedElement == 'b', INVALID_VALUE);
      done();
    });
  });

  it('knows how to handle an error from an empty array', done => {
    chain([], (_, next) => next()).catch(err => {
      assert(err.message == EMPTY_ARRAY);
      assert(err.name == 'ChainError');

      done();
    });
  });

  it('knows how to handle an error passed through next', done => {
    chain(['error'], (child, next) => next(child)).catch(err => {
      assert(err.message == 'error');
      assert(err.name == 'ChainError');

      done();
    });
  });
});
