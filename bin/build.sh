#!/usr/bin/env bash
LEMMATIZATION_LISTS_DIR=$(node -e "var settings = require('./src/settings');console.log(settings.lemmatizationListsDir);");

if [[ ! -d "./$LEMMATIZATION_LISTS_DIR" ]]; then
  LEMMATIZATION_LISTS_REPO=$(node -e "var settings = require('./src/settings');console.log(settings.lemmatizationListsRepo);");

  git clone $LEMMATIZATION_LISTS_REPO
fi
