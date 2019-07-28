// 'use strict';
//
// const assert = require('assert');
// const constants = require('../src/nlp/constants');
// const fs = require('fs');
// const initialMutation = require('../src/nlp/rules/ga/initial-mutation');
// const lex = require('../src/nlp/rules/lex');
// const parsePhases = constants.parsePhases;
// const path = require('path');
// const punctuation = require('../src/nlp/rules/punctuation');
// const rules = require('../src/nlp/rules/index');
// const settings = require('../src/settings');
// const appDir = settings.appDir;
// const supportedLanguages = constants.supportedLanguages;
//
// const RuleProvider = rules.RuleProvider;
// const EnclosingPunctuationToken =
// 	require('../src/nlp/classes/EnclosingPunctuationToken');
// const LinkingPunctuationToken =
// 	require('../src/nlp/classes/LinkingPunctuationToken');
// const OrdinaryPunctuationToken =
// 	require('../src/nlp/classes/OrdinaryPunctuationToken');
// const LexicalToken = require('../src/nlp/classes/LexicalToken');
// const UnprocessedToken = require('../src/nlp/classes/UnprocessedToken');
//
// const INVALID_LENGTH = constants.messages.INVALID_LENGTH;
// const INVALID_MODULE = constants.messages.INVALID_MODULE;
// const INVALID_TYPE = constants.messages.INVALID_TYPE;
// const INVALID_VALUE = constants.messages.INVALID_VALUE;
//
// let getDefaultRuleSettings = () => {
// 	let settingsPath =
// 		path.join(appDir, 'src', 'nlp', 'rules', 'settings.default.json');
//
// 	return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
// }
//
// let getRuleSettings = language => {
// 	let settingsPath =
// 		path.join(appDir, 'src', 'nlp', 'rules', language, 'settings.json');
//
// 		return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
// }
//
// describe('/nlp/rules/index', () => {
// 	describe('#applyTo()', () => {
//     it('applies default rules during linear parse phase', done => {
//       let parent = new UnprocessedToken('(lúibíní!)');
//
//       rules.applyTo(parent, parsePhases.LINEAR, (err, tokens) => {
// 				if (err) throw err;
//
// 				assert(tokens[0] instanceof EnclosingPunctuationToken, INVALID_TYPE);
//         assert(tokens[0].index == 0, INVALID_VALUE);
//         assert(tokens[0].getValue() == '(', INVALID_VALUE);
//         assert(tokens[1] instanceof LexicalToken, INVALID_TYPE);
//         assert(tokens[1].index == 1, INVALID_VALUE);
//         assert(tokens[1].getValue() == 'lúibíní', INVALID_VALUE);
// 				assert(tokens[2] instanceof OrdinaryPunctuationToken, INVALID_TYPE);
//         assert(tokens[2].index == 8, INVALID_VALUE);
//         assert(tokens[2].getValue() == '!', INVALID_VALUE);
// 				assert(tokens[3] instanceof EnclosingPunctuationToken, INVALID_TYPE);
// 				assert(tokens[3].index == 9, INVALID_VALUE);
// 				assert(tokens[3].getValue() == ')', INVALID_VALUE);
//
//         done();
//       });
//     });
//
// 		it('applies Irish language rules during linear parse phase', done => {
// 			let parent = new UnprocessedToken('mh\'anam!');
//
// 			parent.setLanguage(supportedLanguages.IRISH);
//
// 			rules.applyTo(parent, parsePhases.LINEAR, (err, tokens) => {
// 				if (err) throw err;
//
// 				assert(tokens[0] instanceof LexicalToken, INVALID_TYPE);
// 				assert(tokens[0].index == 0, INVALID_VALUE);
// 				assert(tokens[0].getLanguage() == supportedLanguages.IRISH, INVALID_VALUE);
// 				assert(tokens[0].getValue() == 'mh\'anam', INVALID_VALUE);
// 				assert(tokens[0].getInfo('hasMutation') == true, INVALID_VALUE);
// 				assert(tokens[0].getInfo('hasLenition') == true, INVALID_VALUE);
// 				assert(tokens[0].getInfo('hasEclipsis') == false, INVALID_VALUE);
// 				assert(tokens[1] instanceof LinkingPunctuationToken, INVALID_TYPE);
// 				assert(tokens[1].index == 2, INVALID_VALUE);
// 				assert(tokens[1].getValue() == '\'', INVALID_VALUE);
// 				assert(tokens[2] instanceof OrdinaryPunctuationToken, INVALID_TYPE);
// 				assert(tokens[2].index == 7, INVALID_VALUE);
// 				assert(tokens[2].getValue() == '!', INVALID_VALUE);
//
// 				done();
// 			});
// 		});
//   });
//
// 	describe('#RuleProvider', () => {
//     it('knows its values with an unknown language, in linear parse phase, using default settings', done => {
// 			let activeSetting = getDefaultRuleSettings();
// 			let language = supportedLanguages.UNKNOWN;
// 			let phase = parsePhases.LINEAR;
// 			let provider = new RuleProvider(language, phase, activeSetting);
//
// 			let languageSpecific = provider.getLanguageSpecific();
// 			let phaseName = provider.getPhaseName();
// 			let rules = provider.getRules();
// 			let settingPhaseRules = provider.getSettingPhaseRules(phaseName);
//
// 			assert(Object.entries(languageSpecific).length === 0, INVALID_LENGTH);
// 			assert(phaseName == 'LINEAR', `${INVALID_VALUE} Expected 'LINEAR', got '${phaseName}'.`);
// 			assert(settingPhaseRules[0] == 'punctuation', `${INVALID_VALUE} Expected 'punctuation', got '${settingPhaseRules[0]}'.`);
// 			assert(settingPhaseRules[1] == 'lex', `${INVALID_VALUE} Expected 'lex', got '${settingPhaseRules[1]}'.`);
// 			assert(rules[0] == punctuation, `${INVALID_MODULE} Expected \`punctuation\`, got ${rules[0]}.`);
// 			assert(rules[1] == lex, `${INVALID_MODULE} Expected \`lex\`, got ${rules[1]}.`);
// 			done();
//     });
//
// 		it('knows its values with the Irish language in linear parse phase', done => {
// 			let language = supportedLanguages.IRISH;
// 			let activeSetting = getRuleSettings(language);
// 			let phase = parsePhases.LINEAR;
// 			let provider = new RuleProvider(language, phase, activeSetting);
//
// 			let languageSpecific = provider.getLanguageSpecific();
// 			let phaseName = provider.getPhaseName();
// 			let rules = provider.getRules();
// 			let settingPhaseRules = provider.getSettingPhaseRules(phaseName);
//
// 			assert(phaseName == 'LINEAR', `${INVALID_VALUE} Expected 'LINEAR', got '${phaseName}'.`);
// 			assert(settingPhaseRules[0] == 'punctuation', `${INVALID_VALUE} Expected 'punctuation', got '${settingPhaseRules[0]}'.`);
// 			assert(settingPhaseRules[1] == 'lex', `${INVALID_VALUE} Expected 'lex', got '${settingPhaseRules[1]}'.`);
// 			assert(settingPhaseRules[2] == 'initial-mutation', `${INVALID_VALUE} Expected 'initial-mutation', got '${settingPhaseRules[2]}'.`);
// 			assert(rules[0] == punctuation, `${INVALID_MODULE} Expected \`punctuation\`, got ${rules[0]}.`);
// 			assert(rules[1] == lex, `${INVALID_MODULE} Expected \`lex\`, got ${rules[1]}.`);
// 			assert(rules[2] == initialMutation, `${INVALID_MODULE} Expected \`initialMutation\`, got ${rules[2]}.`);
// 			done();
// 		});
//   });
// });
