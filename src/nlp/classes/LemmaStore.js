'use strict';

const constants = require('../constants');
const fs = require('fs');
const path = require('path');
const settings = require('../../settings');
const split2 = require('split2');

const DataStore = require('../../utils/datastores').DataStore;
const LemmaTransform = require('stream').Transform;

const LEMMATIZATION_LISTS_DIR = settings.lemmatizationListsDir;
const LEMMAS_LOADED_KEY = constants.LEMMAS_LOADED_KEY;
const LEMMAS_NAMESPACE = constants.namespaces.LEMMAS;
const LEMMAS_SEPARATOR = constants.LEMMAS_SEPARATOR;

const transforms = {
  splitTabs: () => {
    return new LemmaTransform({
      readableObjectMode: true,
      writeableObjectMode: true,

      transform(chunk, encoding, callback) {
        let column = chunk.toString();
        let words = column.split('\t');

        if (words.length != 2) {
          /* istanbul ignore next */
          console.warn(`Didn't understand lemma column "${column}". Skipping.`);
        } else {
          this.push(JSON.stringify(words));
        }

        callback();
      }
    });
  },
  readIntoDataStore: scope => {
    let contains = (oldValue, newValue) => {
      oldValue = oldValue || '';
      newValue = newValue || '';

      let oldMap = {};

      oldValue.split(LEMMAS_SEPARATOR).forEach(value => {
        oldMap[value] = null
      });

      return newValue in oldMap;
    };

    return new LemmaTransform({
      readableObjectMode: true,

      transform(chunk, encoding, callback) {
        let words = JSON.parse(chunk.toString());

        scope.client.get(words[1], (err, oldValue) => {
          if (err) { // TODO: Cover
            return callback(err);
          }

          let newValue = oldValue && !contains(oldValue, words[0]) ?
            [oldValue, words[0]].join(LEMMAS_SEPARATOR) : words[0];

          if (oldValue != newValue) {
            scope.client.set(words[1], newValue, err => callback(err));
          } else {
            callback();
          }
        });
      }
    });
  }
}

class LemmaStore extends DataStore {
  constructor(config) {
    super(config);

    this.language = config.language || settings.language;
  }

  getNamespace() {
    let langCode = this.language.toUpperCase();

    return `${LEMMAS_NAMESPACE}_${langCode}`;
  }

  load(callback) {
    let scope = this;

    scope.get(LEMMAS_LOADED_KEY, (err, loaded) => {
      if (err) {
        callback(err);
      }

      if (loaded != 1) {
        let lemmaFile = `lemmatization-${this.language}.txt`;
        let lemmaFileFQ =
          path.join(settings.appDir, LEMMATIZATION_LISTS_DIR, lemmaFile);
        let lemmaFileStream = fs.createReadStream(lemmaFileFQ, {encoding: 'utf8'});

        console.log(`Reading from ${lemmaFile}...`);

        lemmaFileStream.pipe(split2())
          .pipe(transforms.splitTabs())
          .pipe(transforms.readIntoDataStore(this))
          .on('error', err => callback(err)) // TODO: Cover
          .on('finish', () => {
            scope.set(LEMMAS_LOADED_KEY, 1, _ => scope.quit(callback))
          });
      } else {
        let langCode = scope.language;

        console.log(`${langCode} already loaded in data store.`);
        callback();
      }
    });
  }
}

module.exports = LemmaStore;
