'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const errors = require('../src/utils/errors');

let INVALID_TYPE = constants.INVALID_TYPE;
let INVALID_VALUE = constants.UNEXPECTED_VALUE;
let UNSUPPORTED_ERR_ATTR = errors.UNSUPPORTED_ERR_ATTR;
let UNSUPPORTED_TYPE_ATTR = errors.UNSUPPORTED_TYPE_ATTR;

let FatalError = errors.FatalError;
let TypedError = errors.TypedError;

describe('/utils/errors', () => {
  describe('#getTypedError()', () => {
    it('knows how to return an instance of a typed error as-is', done => {
      let err = new TypedError('This is typed.');
      let typedErr = errors.getTypedError(err, TypedError);

      assert(err === typedErr, INVALID_VALUE);
      done();
    });

    it('knows how to handle a fatal error when given an unsupported object', done => {
      let fatalErr;

      try {
        let typedErr = errors.getTypedError([], TypedError);
      } catch(e) {
        fatalErr = e;
      }

      let message = `${UNSUPPORTED_ERR_ATTR} Received: ${[].constructor.toString()}`;

      assert(fatalErr instanceof FatalError, INVALID_TYPE);
      assert(fatalErr.message == message, INVALID_VALUE);
      done();
    });

    it('knows how to handle a fatal error when given an unsupported type', done => {
      let fatalErr;
      let type = Array;

      try {
        let typedErr = errors.getTypedError('test', type);
      } catch(e) {
        fatalErr = e;
      }

      let message = `${UNSUPPORTED_TYPE_ATTR} Received: ${type.toString()}`;
      
      assert(fatalErr instanceof FatalError, INVALID_TYPE);
      assert(fatalErr.message == message, INVALID_VALUE);
      done();
    });

    it('expects null when given null', done => {
      assert(errors.getTypedError() == null, INVALID_VALUE);
      done();
    });
  });
});
