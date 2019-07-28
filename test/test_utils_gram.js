const assert = require('assert');
const composeGrams = require('../src/utils/gram').composeGrams;

const Gram = require('../src/utils/gram').Gram;

const INVALID_LENGTH = 'Wrong length.';
const INVALID_SCOPE = 'Wrong scope!';
const INVALID_VALUE = 'Wrong value.';
const TEST_NS = 'test_namespace';

class ValueGram extends Gram {
  constructor(value) {
    super();

    this.value = value;
  }
}

describe('/util/gram', () => {
	describe('#Gram', () => {
    it('knows its info', done => {
      let grams = [new ValueGram('a'), new ValueGram('b'), new ValueGram('c')];

      grams[0].setGramInfo(TEST_NS, grams, 0);
      grams[1].setGramInfo(TEST_NS, grams, 1);
      grams[2].setGramInfo(TEST_NS, grams, 2);

      let gramInfo0 = grams[0].getGramInfo(TEST_NS);
      let gramInfo1 = grams[1].getGramInfo(TEST_NS);
      let gramInfo2 = grams[2].getGramInfo(TEST_NS);

      assert(gramInfo0.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo0.ownIndex == 0, INVALID_VALUE);
      assert(gramInfo0.namespace == TEST_NS, INVALID_VALUE);

      assert(gramInfo1.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo1.ownIndex == 1, INVALID_VALUE);
      assert(gramInfo1.namespace == TEST_NS, INVALID_VALUE);

      assert(gramInfo2.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo2.ownIndex == 2, INVALID_VALUE);
      assert(gramInfo2.namespace == TEST_NS, INVALID_VALUE);

      done();
    });

    it('knows how to access a gram with its neighbours', done => {
      let gram0 = new ValueGram('a');
      let gram1 = new ValueGram('b');
      let gram2 = new ValueGram('c');

      composeGrams(TEST_NS, gram0, gram1, gram2);

      new Promise((resolve, reject) => {
        gram0.accessGram(TEST_NS, function(previous, next, gramInfo) {
          let current = this;

          assert(this === gram0, INVALID_SCOPE);
          assert(previous == null, INVALID_VALUE);
          assert(next === gram1, INVALID_VALUE);
          assert(this.value == 'a', INVALID_VALUE);
          assert(gramInfo.ownIndex == 0, INVALID_VALUE);

          resolve();
        });
      }).then(() => {
        new Promise((resolve, reject) => {
          gram1.accessGram(TEST_NS, function(previous, next, gramInfo) {
            let current = this;

            assert(this === gram1, INVALID_SCOPE);
            assert(previous === gram0, INVALID_VALUE);
            assert(next === gram2, INVALID_VALUE);
            assert(this.value == 'b', INVALID_VALUE);
            assert(gramInfo.ownIndex == 1, INVALID_VALUE);

            resolve();
          });
        });
      }).then(() => {
        gram2.accessGram(TEST_NS, function(previous, next, gramInfo) {
          let current = this;

          assert(this === gram2, INVALID_SCOPE);
          assert(previous === gram1, INVALID_VALUE);
          assert(next === null, INVALID_VALUE);
          assert(this.value == 'c', INVALID_VALUE);
          assert(gramInfo.ownIndex == 2, INVALID_VALUE);

          done();
        });
      });
    });
	});

  describe('#composeGrams', () => {
    it('knows the info of what it just composed', done => {
      let grams = [new ValueGram('a'), new ValueGram('b'), new ValueGram('c')];

      composeGrams(TEST_NS, grams[0], grams[1], grams[2]);

      let gramInfo0 = grams[0].getGramInfo(TEST_NS);
      let gramInfo1 = grams[1].getGramInfo(TEST_NS);
      let gramInfo2 = grams[2].getGramInfo(TEST_NS);

      assert(gramInfo0.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo0.ownIndex == 0, INVALID_VALUE);
      assert(gramInfo0.namespace == TEST_NS, INVALID_VALUE);

      assert(gramInfo1.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo1.ownIndex == 1, INVALID_VALUE);
      assert(gramInfo1.namespace == TEST_NS, INVALID_VALUE);

      assert(gramInfo2.allGrams.length == 3, INVALID_LENGTH);
      assert(gramInfo2.ownIndex == 2, INVALID_VALUE);
      assert(gramInfo2.namespace == TEST_NS, INVALID_VALUE);

      done();
    });
	});
});
