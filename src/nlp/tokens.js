'use strict';

const constants = require('./constants');
const errors = require('../utils/errors');
const split2 = require('split2');
const rules2 = require('./rules2/index');

const Token = require('./classes/Token');
const TokenGroup = require('./classes/TokenGroup');
const TokenReadable = require('stream').Readable;
const TokenTransform = require('stream').Transform;
const TypedError = errors.TypedError;

class TokensError extends TypedError {
  constructor(message) {
    super(message);

    this.name = 'TokensError';
  }
}

const FAILED_IN_READSTREAM = 'Failed while processing Readable stream.';

const parsePhases = constants.parsePhases;

const transforms = {
  readIntoTokenGroups: scope => {
    return new TokenTransform({
      transform(chunk, encoding, callback) {
        let tokenGroup = new TokenGroup();
        let err;

        scope.push(tokenGroup);

        try {
          tokenGroup.setRaw(chunk.toString());
          tokenGroup.parse(parsePhases.PREP, rules2);
          tokenGroup.parse(parsePhases.LINEAR, rules2);
        } catch (e) { /* istanbul ignore next */
          err = e;
        } finally {
          return callback(err);
        }
      }
    });
  }
};

let handleError = (err, reason, callback) => {
  err = errors.getTypedError(err);

  let tokensErr = errors.getTypedError(reason, TokensError);

  tokensErr.addError(err);

  return callback(tokensErr, null);
}

module.exports = {
  fromReadStream: function(readStream, callback) {
    let tokenGroups = [];

    readStream.pipe(split2())
      .pipe(transforms.readIntoTokenGroups(tokenGroups))
      .on('error', /* istanbul ignore next */
        err => handleError(err, FAILED_IN_READSTREAM, callback))
      .on('finish', () => callback(null, tokenGroups));
  },
  fromString: function(str, callback) {
    let readStream = new TokenReadable();
    let err;

    try {
      readStream._read = () => {}; // noop
      readStream.push(str);
      readStream.push(null);
    } catch (e) {
      err = e;
    }

    if (err) {
      return handleError(err, FAILED_IN_READSTREAM, callback);
    } else {
      return this.fromReadStream(readStream, callback);
    }
  },
  Token: Token,
  FAILED_IN_READSTREAM: FAILED_IN_READSTREAM
};
