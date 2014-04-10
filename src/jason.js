import './traceur-runtime';
import { match, ltrim } from './util';

// some tokens!
const LEFT_BRACE = '{';
const RIGHT_BRACE = '}';
const LEFT_BRACKET = '[';
const RIGHT_BRACKET = ']';
const COLON = ':';
const COMMA = ',';
const QUOTE = '"';

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
  // TODO: a bunch of weird control chars
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => lexString(rest, acc + char),
    [QUOTE, () => [new Token('string', acc), rest]],
    [undefined, () => { throw new Error('No matching quote found for string'); }]
  );
};

let lexAlpha = function(input, acc = '') {
  // TODO: a bunch of weird control chars
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

let lexNumber = function(input, acc) {
  // TODO: this shit is bananas: http://www.json.org/number.gif
};

let lexCharacter = function(input) {
  return [ new Token(input[0]), input.slice(1) ];
};

let lex = function(input) {
  // return an array of tokens
  input = ltrim(input);
  let char = input[0];

  // poor man's pattern matching
  let rest = input.slice(1);

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
    [QUOTE, () => lexString(rest)],
    [ALPHA, () => lexAlpha(input)],
    [NUMBER_START, () => lexNumber(input)]
  );

  if ( rest === null ) {
    return [sym];
  }

  return [sym, ...lex(rest)];
};


// Parsing
// =================

let parse = function(tokens) {
  // ...
};

export default function(input) {
  let tokens = lex(input);
  console.log(tokens);
  return parse(tokens);
}
