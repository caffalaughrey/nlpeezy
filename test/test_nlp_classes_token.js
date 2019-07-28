'use strict';
const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;
const punctuationTypes = constants.punctuationTypes;

const Token = require('../src/nlp/classes/Token');

const INVALID_PUNCTUATION_TYPE = messages.INVALID_PUNCTUATION_TYPE;
const NON_STRING_VALUE = messages.NON_STRING_VALUE;
const UNEXPECTED_LENGTH = messages.UNEXPECTED_LENGTH;
const UNEXPECTED_TOKEN = messages.UNEXPECTED_TOKEN;
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;
const UNSUPPORTED_LANGUAGE = messages.UNSUPPORTED_LANGUAGE;

describe('/nlp/classes/Token', () => {
	describe('#Token', () => {
    it('recognises ordinary punctuation', done => {
      let withPunct = new Token('camóg,');
			let withoutPunct = new Token('lom');

      assert(withPunct.hasPunctuation(punctuationTypes.ORDINARY),
				UNEXPECTED_VALUE);
			assert(!withoutPunct.hasPunctuation(punctuationTypes.ORDINARY),
				UNEXPECTED_VALUE);

      done();
    });

		it('recognises enclosing punctuation', done => {
      let withPunct = new Token('(lúibíní)');
			let withoutPunct = new Token('lom');

      assert(withPunct.hasPunctuation(punctuationTypes.ENCLOSING),
				UNEXPECTED_VALUE);
			assert(!withoutPunct.hasPunctuation(punctuationTypes.ENCLOSING),
				UNEXPECTED_VALUE);

      done();
    });

		it('recognises linking punctuation', done => {
			let withPunct = new Token('m\'uaschamóg');
			let withoutPunct = new Token('lom');

			assert(withPunct.hasPunctuation(punctuationTypes.LINKING),
				UNEXPECTED_VALUE);
			assert(!withoutPunct.hasPunctuation(punctuationTypes.LINKING),
				UNEXPECTED_VALUE);

			done();
		});

		it('throws an error when checking invalid punctuation type', done => {
			let err;
			let token = new Token('iarracht');

			try {
				token.hasPunctuation('INVALID');
			} catch(e) {
				err = e;
			}

			assert(err.message == INVALID_PUNCTUATION_TYPE, UNEXPECTED_VALUE);

			done();
		});

		it('throws an error when evaluating non-string', done => {
			let err;
			let token = new Token({});

			try {
				token.hasPunctuation(punctuationTypes.LINKING);
			} catch(e) {
				err = e;
			}

			assert(err.message = NON_STRING_VALUE, UNEXPECTED_VALUE);

			done();
		});

		it('throws an error when setting an unsupported language', done => {
			let err;
			let language = 'tlh';
			let token = new Token('jIyajbeʼ');

			try {
				token.setLanguage(language);
			} catch(e) {
				err = e;
			}

			assert(err.message = `${UNSUPPORTED_LANGUAGE}: ${language}`,
					UNEXPECTED_VALUE);

			done();
		});
  });
});
