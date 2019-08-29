#!/usr/bin/env node
'use strict';

const argparse = require('argparse');
const chain = require('../src/utils/chain');
const constants = require('../src/nlp/constants');
const settings = require('../src/settings');
const supportedLanguages = function() {
  let arr = [];

  Object.keys(constants.supportedLanguages).forEach(name =>
    name != 'UNKNOWN' ? arr.push(constants.supportedLanguages[name]) : null);

  arr.sort();

  return arr;
} ();

const ArgumentParser = argparse.ArgumentParser;
const LemmaStore = require('../src/nlp/classes/LemmaStore');

var parser = new ArgumentParser({
  version: '0.1.0',
  addHelp:true,
  description: 'Lemma manager CLI'
});

parser.addArgument(
  [ '-a', '--all' ],
  {
    action: 'storeTrue',
    defaultValue: false,
    help: 'Load all lemmatization list files into data store.'
  }
);

parser.addArgument(
  '--datastore',
  {
    choices: [/*'memcached', */'redis'], // memcached for future use.
    defaultValue: 'redis',
    help: 'Supported data store to use. Default: "redis".'
  }
);

parser.addArgument(
  [ '-l', '--language' ],
  {
    action: 'append',
    choices: supportedLanguages,
    help: 'Supported language code for which to load lemmatization list file into data store.'
  }
);

function load(languages, datastore) {
  chain(languages, (language, next) => {
    console.log(`Loading lemmas for ${language} into ${datastore}`);

    let config = {language: language, strategy: datastore};
    let lemmaStore = new LemmaStore(config);

    lemmaStore.initClient();
    lemmaStore.load(next);
  }).then(_ => {
    console.log('Finished loading lemmas.');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

let args = parser.parseArgs();
let datastore = args.datastore, languages;

if (!args.all && !args.language) {
  parser.printHelp();
  console.error('error: must specify either -a or -l argument.');
  return process.exit(1);
} else if (args.all) {
  languages = supportedLanguages;
} else if (args.language) {
  languages = args.language;
}

load(languages, datastore);
