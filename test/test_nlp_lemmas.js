const assert = require('assert');
const chain = require('../src/utils/chain');
const constants = require('../src/nlp/constants');
const errors = require('../src/utils/errors');
const lemmas = require('../src/nlp/lemmas');
const messages = constants.messages;
const strategies = require('../src/utils/datastores').strategies;
const supportedLanguages = constants.supportedLanguages;
const tokens = require('../src/nlp/tokens');

const BASIC_CONFIG =  {language: supportedLanguages.IRISH};
const BASIC_SAMPLE = 'Maraithe le tae is maraithe gan é.';
const INVALID_LENGTH = messages.INVALID_LENGTH;
const INVALID_VALUE = messages.INVALID_VALUE;

describe('/nlp/lemmas', () => {
  before(done => {
    let config =
      {language: supportedLanguages.IRISH, strategy: strategies.MEMORY};

    lemmas.loadStore(config, _ => done());
  });

	describe('#fromTokenGroup()', () => {
    it('knows lemmas looked up from a token group', done => {
      let lemmasArray = [];
      let config = {language: supportedLanguages.IRISH};
      let tokenGroups = [];

      tokens.fromString(BASIC_SAMPLE, BASIC_CONFIG, (err, groups) => {
        if (err) throw err;

        chain(groups, (tokenGroup, next) => {
          lemmas.fromTokenGroup(tokenGroup, config, (err, l) => {
            if (err) {
              return next(err);
            }

            lemmasArray = lemmasArray.concat(l);
            tokenGroups.push(tokenGroup);

            next();
          });
        }).then(() => {
          let children = tokenGroups[0].children;

          assert(lemmasArray.length === 1, INVALID_LENGTH);
          assert(lemmasArray[0]['maraithe'] == 'maraigh', INVALID_VALUE);
          assert(lemmasArray[0]['le'] == 'le', INVALID_VALUE);
          assert(lemmasArray[0]['tae'] == 'tae', INVALID_VALUE);
          assert(lemmasArray[0]['is'] == 'is', INVALID_VALUE);
          assert(lemmasArray[0]['gan'] == 'gan', INVALID_VALUE);
          assert(lemmasArray[0]['é'] == 'é', INVALID_VALUE);
          assert(tokenGroups.length === 1, INVALID_LENGTH);
          assert(children[1].getLemma().getProbableValue() == 'maraigh',
            INVALID_VALUE);
          assert(children[3].getLemma().getProbableValue() == 'le',
            INVALID_VALUE);
          assert(children[5].getLemma().getProbableValue() == 'tae',
            INVALID_VALUE);
          assert(children[7].getLemma().getProbableValue() == 'is',
            INVALID_VALUE);
          assert(children[9].getLemma().getProbableValue() == 'maraigh',
            INVALID_VALUE);
          assert(children[11].getLemma().getProbableValue() == 'gan',
            INVALID_VALUE);
          assert(children[13].getLemma().getProbableValue() == 'é',
            INVALID_VALUE);
          done();
        });
      });
    });
  });
});
