'use strict';

const assert = require('assert');
const constants = require('../src/nlp/constants');
const datastores = require('../src/utils/datastores');
const messages = constants.messages;
const strategies = datastores.strategies;

const DataStore = datastores.DataStore;

const TEST_NAMESPACE = 'teststore';
const UNEXPECTED_VALUE = messages.UNEXPECTED_VALUE;

class TestStore extends DataStore {
  load(callback) {
    this.set('foo', 'bar', (err, _) => callback(err));
  }

  getNamespace() {
    return TEST_NAMESPACE;
  }
}

describe('/utils/datastores', () => {
	describe('#DataStore', () => {
    it('knows a test store with memory client', done => {
      let testStore = new TestStore();

      testStore.initClient();
      testStore.load(err => {
        if (err) {
          throw err;
        }

        testStore.get('foo', (err, value) => {
          assert(value == 'bar', UNEXPECTED_VALUE);
          
          testStore.quit(_ => done());
        });
      });
    });

    it('knows a test store with redis client', done => {
      let testStore = new TestStore({strategy: strategies.REDIS});

      testStore.initClient();
      testStore.load(err => {
        if (err) {
          throw err;
        }

        testStore.get('foo', (err, value) => {
          assert(value == 'bar', UNEXPECTED_VALUE);

          testStore.quit(_ => done());
        });
      });
    });
  });
});
