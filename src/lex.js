import { match, ltrim } from './util';
let m = require('mori');

// some tokens!
export const LEFT_BRACE = '{';
export const RIGHT_BRACE = '}';
export const LEFT_BRACKET = '[';
export const RIGHT_BRACKET = ']';
export const COLON = ':';
export const COMMA = ',';
export const QUOTE = '"';

// number things
const DIGIT = /[0-9]/;
const ZERO = '0';
const NONZERO_DIGIT = /[1-9]/;
const E = /[e|E]/;
const PERIOD = '.';
const PLUS = '+';
const MINUS = '-';

const TRUE = 'true';
const FALSE = 'false';
const NULL = 'null';

const ALPHA = /[a-z]/;

const NUMBER_START = /[-|\d]/;

let Token = function(type, value) {
  this.type = type;
  this.value = value;
};


function makeLexFn(cb) {
  return function(input, acc) {
    let cur = input[0];
    let rest = input.slice(1);
    return cb(cur, rest, acc);
  };
}

/**
 * Lexing strings
 */
let lexString = makeLexFn((cur, rest, acc) => match(
  cur,
  () => lexString(rest, (acc || '') + cur),
  [QUOTE, () => [new Token('string', acc), rest]],
  [undefined, () => { throw new Error('No matching quote found for string'); }]
));

/**
 * Lexing true, false, and null
 */
let lexAlpha = makeLexFn((cur, rest, acc) => match(
  cur,
  () => match(
    acc,
    () => { throw new Error('Unexpected token ' + acc); },
    [TRUE, () => [new Token(TRUE), rest]],
    [FALSE, () => [new Token(FALSE), rest]],
    [NULL, () => [new Token(NULL), rest]]
  ),
  [ALPHA, () => lexAlpha(rest, (acc || '') + cur)]
));

/**
 * Lexing numbers
 * See http://www.json.org/number.gif
 *
 * A number token has:
 *   negative (optional)
 *   int
 *   frac (optional)
 *   exp (optional)
 *   expNegative (optional)
 */

let lexExpPiece = makeLexFn((cur, rest, acc) => match(
  cur,
  () => [new Token('number', m.clj_to_js(acc)), cur + rest],
  [DIGIT, () => lexExpPiece(rest, m.assoc(acc, 'exp', (m.get(acc, 'exp') || '') + cur))]
));

let lexExp = makeLexFn((cur, rest, acc) => match(
  cur,
  () => [new Token('number', m.clj_to_js(acc)), cur + rest],
  [PLUS, () => lexExpPiece(rest, acc)],
  [MINUS, () => lexExpPiece(rest, m.assoc(acc, 'expNegative', true))],
  [DIGIT, () => lexExpPiece(cur + rest, acc)]
));

let lexFracPiece = makeLexFn((cur, rest, acc) => match(
  cur,
  () => [new Token('number', m.clj_to_js(acc)), cur + rest],
  [DIGIT, () => lexFracPiece(rest, m.assoc(acc, 'frac', (m.get(acc, 'frac') || '') + cur))],
  [E, () => lexExp(rest, acc)]
));

let lexOptionalDecimal = makeLexFn((cur, rest, acc) => match(
  cur,
  () => [new Token('number', m.clj_to_js(acc)), cur + rest],
  [PERIOD, () => lexFracPiece(rest, acc)],
  [E, () => lexExp(rest, acc)]
));

let lexIntPiece = makeLexFn((cur, rest, acc) => match(
  cur,
  () => [new Token('number', m.clj_to_js(acc)), cur + rest],
  [DIGIT, () => lexIntPiece(rest, m.assoc(acc, 'int', (m.get(acc, 'int') || '') + cur))],
  [PERIOD, () => lexFracPiece(rest, acc)],
  [E, () => lexExp(rest, acc)]
));

let lexNumber = makeLexFn((cur, rest, acc) => match(
  cur,
  () => { throw new Error('Unexpected token ' + cur); },
  [ZERO, () => {
    acc = acc || m.hash_map();
    return lexOptionalDecimal(rest, m.assoc(acc, 'int', '0'));
  }],
  [NONZERO_DIGIT, () => {
    acc = acc || m.hash_map();
    return lexIntPiece(cur + rest, acc);
  }],
  [MINUS, () => {
    if ( acc && m.get(acc, 'negative') === true ) {
      throw new Error('Unexpected token ' + cur);
    }
    return lexNumber(rest, m.assoc(acc, 'negative', true));
  }]
));

/**
 * Lexing single characters ({ } [ ] : ,)
 */
let lexCharacter = function(input) {
  return [ new Token(input[0]), input.slice(1) ];
};

/**
 * Main lexer
 */
export default function lex(input) {
  // return an array of tokens
  input = ltrim(input);
  let char = input[0];

  let [sym, rest] = match(
    char,

    // no-match condition
    () => { throw new Error('Failed to parse character ' + char); },

    // end of input
    [undefined, () => [ null, null ]],

    // single characters
    [LEFT_BRACE, () => lexCharacter(input)],
    [RIGHT_BRACE, () => lexCharacter(input)],
    [LEFT_BRACKET, () => lexCharacter(input)],
    [RIGHT_BRACKET, () => lexCharacter(input)],
    [COMMA, () => lexCharacter(input)],
    [COLON, () => lexCharacter(input)],

    // more interesting things
    [QUOTE, () => lexString(input.slice(1))],
    [ALPHA, () => lexAlpha(input)],
    [NUMBER_START, () => lexNumber(input)]
  );

  if ( rest === null ) {
    return [sym];
  }

  return [sym, ...lex(rest)];
}
