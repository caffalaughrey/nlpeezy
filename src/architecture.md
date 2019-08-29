# nlp
## Top-level modules
The top-level modules are broken up accordingly:

* src/
   * index.js (entry point)
      * nlp/
         * lemmas.js
         * tokens.js

The exported `analyze()` function of index.js is the primary entry point to
nlpeezy. The feature modules under the nlp directory are responsible for:
   1. Handling string, `ReadStream`, and/or serialised `TokenGroup` i/o at top
   level.
   2. Reading data from datastore required in pending parser events (eg. asking
   Redis for lemma data before `LEMMAS` event is called)
   3. Calling the `parse()` function of a `TokenGroup`, which then kicks off
   rules needed for the parser event type.

## Parser Events
0. **`TOKENS_RAW`**: The event during which the raw input text is parsed into
instances of `TokenGroup` which represent individual lines comprised of:
   * `BeginLineToken`
   * `SpaceToken`
   * `UnprocessedToken`
1. **`TOKENS_TYPED`**: The event during which any `UnprocessedToken` of a given
`TokenGroup` (line from the original text) is parsed to determine whether it can
be unwound into the following specific types of tokens:
   * `EnclosingPunctuationToken`
   * `LinkingPunctuationToken`
   * `OrdinaryPunctuationToken`
   * `LexicalToken`
2. **`LEMMAS`**: The event during which any `UnprocessedToken` or `LexicalToken`
of a `TokenGroup` is lemmatised.
3. **`POS`**: The event during which instances of `Token` will be assigned
predicted part-of-speech features. (Future use)
4. **`LAYOUT`**: The event during which lines will be sub-divided
into sentences based on terminal punctuation. The plan is also to at least
partially resolve single quotation vs. apostrophe during this step. (Future use)

## Rules
During the parser events, rules are applied iteratively to each token in order
to yield the types mentioned above. For instance, in the **TOKENS_RAW** event,
a 'token' is considered a primitive string as type serialisation is not yet
complete. In the **TOKENS_TYPED** event, a 'token' is an instance of
`UnprocessedToken`. If an unprocessed token can't be unwound at this point, it
is left unaltered.

As a secondary feature, rules can also be applied to tokens in order to perform
simple analysis, or prepare features for later use.

In src/nlp/rules, there is a file called settings.default.json which defines the
order in which rules are called for each parse phase. This can be overridden
where there are language-specific rules by:
   1. Creating a directory within rules/ for the language code (eg. 'ga/')
   2. Adding modules with features required for the language. In these modules,
   you must export an implementation of an object containing the function
   `applyTo(token, eventType)`.
   3. Add a settings.json file to the language directory. The recommendation
   here is to clone the settings.default.json file from rules/, then add
   custom modules from step #2 above by name.
