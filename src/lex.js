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

// Lexing
// =================

let lexString = function(input, acc = '') {
  let char = input[0];
  let rest = input.slice(1);

  // TODO: a bunch of weird control chars
  return match(
    char,
    () => lexString(rest, acc + char),
    [QUOTE, () => [new Token('string', acc), rest]],
    [undefined, () => { throw new Error('No matching quote found for string'); }]
  );
};

let lexAlpha = function(input, acc = '') {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => match(
      acc,
      () => { throw new Error('Unexpected token ' + acc); },
      [TRUE, () => [new Token(TRUE), rest]],
      [FALSE, () => [new Token(FALSE), rest]],
      [NULL, () => [new Token(NULL), rest]]
    ),
    [ALPHA, () => lexAlpha(rest, acc + char)]
  );
};

/**
 * A number token has:
 *   negative (optional)
 *   int
 *   frac (optional)
 *   exp (optional)
 *   expNegative (optional)
 */

let lexExpPiece = function(input, acc) {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => [new Token('number', m.clj_to_js(acc)), input],
    [DIGIT, () => lexExpPiece(rest, m.assoc(acc, 'exp', (m.get(acc, 'exp') || '') + char))]
  );
};

let lexExp = function(input, acc) {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => [new Token('number', m.clj_to_js(acc)), input],
    [PLUS, () => lexExpPiece(rest, acc)],
    [MINUS, () => lexExpPiece(rest, m.assoc(acc, 'expNegative', true))],
    [DIGIT, () => lexExpPiece(input, acc)]
  );
};

let lexFracPiece = function(input, acc) {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => [new Token('number', m.clj_to_js(acc)), input],
    [DIGIT, () => lexFracPiece(rest, m.assoc(acc, 'frac', (m.get(acc, 'frac') || '') + char))],
    [E, () => lexExp(rest, acc)]
  );
};

let lexOptionalDecimal = function(input, acc) {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => [new Token('number', m.clj_to_js(acc)), input],
    [PERIOD, () => lexFracPiece(rest, acc)],
    [E, () => lexExp(rest, acc)]
  );
};

let lexIntPiece = function(input, acc) {
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => [new Token('number', m.clj_to_js(acc)), input],
    [DIGIT, () => lexIntPiece(rest, m.assoc(acc, 'int', (m.get(acc, 'int') || '') + char))],
    [PERIOD, () => lexFracPiece(rest, acc)],
    [E, () => lexExp(rest, acc)]
  );
};

let lexNumber = function(input, acc = m.hash_map()) {
  // http://www.json.org/number.gif

  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => { throw new Error('Unexpected token ' + char); },
    [ZERO, () => lexOptionalDecimal(rest, m.assoc(acc, 'int', '0'))],
    [NONZERO_DIGIT, () => lexIntPiece(input, acc)],
    [MINUS, () => {
      if ( m.get(acc, 'negative') === true ) {
        throw new Error('Unexpected token ' + char);
      }
      return lexNumber(rest, m.assoc(acc, 'negative', true));
    }]
  );
};

let lexCharacter = function(input) {
  return [ new Token(input[0]), input.slice(1) ];
};

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

  console.log(sym);

  if ( rest === null ) {
    return [sym];
  }

  return [sym, ...lex(rest)];
}
