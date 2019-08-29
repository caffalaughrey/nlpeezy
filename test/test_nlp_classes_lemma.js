'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const messages = constants.messages;

const Lemma = require('../src/nlp/classes/Lemma');
const LexicalToken = require('../src/nlp/classes/LexicalToken');

const UNEXPECTED_LENGTH = messages.UNEXPECTED_LENGTH;
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;

describe('/nlp/classes/Lemma', () => {
	describe('#Lemma', () => {
    it('knows a lemma with multiple values', done => {
      let token = new LexicalToken('bearnaí');
      let lemma = new Lemma(token, 'bearna bearnach bearnaigh');
      let values = lemma.getValues();

      assert(lemma.getToken() == token, UNEXPECTED_VALUE);
      assert(lemma.getProbableValue() == 'bearna', UNEXPECTED_VALUE);
      assert(values[0] == 'bearna', UNEXPECTED_VALUE);
      assert(values[1] == 'bearnach', UNEXPECTED_VALUE);
      assert(values[2] == 'bearnaigh', UNEXPECTED_VALUE);
      assert(values.length == 3, UNEXPECTED_LENGTH);

      done();
    });

    it('knows a lemma with a single value', done => {
      let token = new LexicalToken('dúchais');
      let lemma = new Lemma(token, 'dúchas');
      let values = lemma.getValues();

      assert(lemma.getToken() == token, UNEXPECTED_VALUE);
      assert(lemma.getProbableValue() == 'dúchas', UNEXPECTED_VALUE);
      assert(values[0] == 'dúchas', UNEXPECTED_VALUE);
      assert(values.length == 1, UNEXPECTED_LENGTH);

      done();
    });
  });
});
