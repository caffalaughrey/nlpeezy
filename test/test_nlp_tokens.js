'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const errors = require('../src/utils/errors');
const messages = constants.messages;
const supportedLanguages = constants.supportedLanguages;
const tokens = require('../src/nlp/tokens');

const BASIC_CONFIG =  {language: supportedLanguages.IRISH};
const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const CHUNK_COMPLAINT =
	'The "chunk" argument must be one of type string, Buffer, or Uint8Array.';
const FAILED_IN_READSTREAM = tokens.FAILED_IN_READSTREAM;
const INVALID_TYPE = messages.INVALID_TYPE;
const INVALID_VALUE = messages.INVALID_VALUE;

const TypedError = errors.TypedError;

describe('/nlp/tokens', () => {
	describe('#fromString()', () => {
    it('knows its token groups from a string', done => {
      tokens.fromString(BASIC_SAMPLE, BASIC_CONFIG, (err, tokenGroups) => {
        if (err) {
          throw err;
        }

        done();
      });
    });

    it('knows an error produced from invalid data', done => {
      tokens.fromString({invalid: 'data'}, BASIC_CONFIG, (err, tokenGroups) => {
        let errs = err.getErrors();

				assert(errs[0].message == FAILED_IN_READSTREAM, INVALID_VALUE);
				assert(errs[0].name == 'TokensError', INVALID_TYPE);
				assert(errs[1].message.indexOf(CHUNK_COMPLAINT) == 0,
					INVALID_VALUE);
				assert(errs[1].name == 'TypedError', INVALID_TYPE);
				assert(errs[1] instanceof TypedError, INVALID_TYPE)
        done();
      });
    });
  });
});
