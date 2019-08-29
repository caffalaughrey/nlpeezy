# nlpeezy

[![Build Status](https://travis-ci.com/caffalaughrey/nlpeezy.svg?branch=master)](https://travis-ci.com/caffalaughrey/nlpeezy)
[![npm version](https://badge.fury.io/js/nlpeezy.svg)](https://badge.fury.io/js/nlpeezy)

A natural language processing package written in Javascript.

by Aaron Caffrey

## Table of Contents
- [Contributors](#contributors)
* [Dependencies](#dependencies)
* [Getting Started](#getting-started)
   - [Install](#install)
   - [Build](#build)
   - [Load Datastore](#load-datastore)
   - [First Run](#first-run)

## Contributors
Thanks goes to the package contributors as found on the [GitHub Contributors page][https://github.com/caffalaughrey/nlpeezy/graphs/contributors].

Also, a special thanks goes to Michal Měchura, on whose
[Lemmatization Lists repository](https://github.com/michmech/lemmatization-lists)
the lemmas feature of this package relies. Go raibh míle!

## Dependencies
The following must be installed before nlpeezy can be used:
* [Node.js latest](https://nodejs.org/en/download/)
* [Redis latest](https://redis.io/download)
* [A Git client](https://git-scm.com/downloads)

## Getting Started
### Install
As of the 1.0 beta, the recommendation is to install nlpeezy as a global
dependency, like so:

```bash
npm install -g nlpeezy
```

### Build
The build step is required to use data-dependent features (eg. lemmatization.)

```bash
nlpeezy-build
```

As of the 1.0 beta, the script's only function is to clone Michal Měchura's
[Lemmatization Lists repository](https://github.com/michmech/lemmatization-lists).
As new features are introduced (eg. the POS tagger), the build script will
likely expand to gather other open source NLP data.

### Load Datastore
In addition to the build step, data-dependent features require the datastore
(Redis) to be prepared for use. As of the 1.0 beta, lemmatization is the only
data-dependent feature, and is managed by the `lemma-manager` script.

```bash
$ lemma-manager --help
usage: lemma-manager [-h] [-v] [-a] [--datastore {redis}] [-l {en,es,fr,ga}]

Lemma manager CLI

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program\'s version number and exit.
  -a, --all             Load all lemmatization list files into data store.
  --datastore {redis}   Supported data store to use. Default: "redis".
  -l {en,es,fr,ga}, --language {en,es,fr,ga}
                        Supported language code for which to load
                        lemmatization list file into data store.
```

Here is a simple example where the cache is loaded with the lemmas for Irish:

```bash
lemma-manager --l ga
```

Note this script takes a moment to complete.

### First Run
This example demonstrates how to print an array of tokens parsed from a sample
value in Irish.

```javascript
const nlp = require('nlpeezy');

let value = 'Maraithe le tae agus maraithe gan é.';

nlp.analyze(value, {language: 'ga'}, (err, tokenGroups) => {
  if (err) {
    return console.error(err);
  }

  // `tokenGroups` is an Array where each element is a `TokenGroup` instance
  // that represents a line of text. The `children` of that element is an Array
  // of the tokens themselves.

  console.log(tokenGroups[0].children);
});
```

This logs something like:

```
[
  BeginLineToken {
    index: 0,
    info: {},
    value: undefined,
    lemma: null
  },
  LexicalToken {
    index: 0,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'Maraithe',
    lemma: Lemma { value: 'marú' }
  },
  SpaceToken {
    index: 8,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 9,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'le',
    lemma: Lemma { value: 'le' }
  },
  SpaceToken {
    index: 11,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 12,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'tae',
    lemma: Lemma { value: 'tae' }
  },
  SpaceToken {
    index: 15,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 16,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'is',
    lemma: Lemma { value: 'is' }
  },
  SpaceToken {
    index: 18,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 19,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'maraithe',
    lemma: Lemma { value: 'marú' }
  },
  SpaceToken {
    index: 27,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 28,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'gan',
    lemma: Lemma { value: 'gan' }
  },
  SpaceToken {
    index: 31,
    info: {},
    value: ' ',
    lemma: null
  },
  LexicalToken {
    index: 32,
    info: { hasEclipsis: false, hasLenition: false, hasMutation: false },
    value: 'é',
    lemma: Lemma { value: 'é' }
  },
  OrdinaryPunctuationToken {
    index: 33,
    info: {},
    value: '.',
    lemma: null
  }
]
```
