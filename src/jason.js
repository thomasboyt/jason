require('./traceur-runtime');
let m = require('mori');

import lex from './lex';

import {
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  COLON,
  COMMA,
  QUOTE
} from './lex';

// Parsing
// =================

export let parse = function(tokens) {
  let current = tokens[0];

  // TODO: everything
};

export default function(input) {
  let tokens = lex(input);
  console.log(tokens);
  return parse(tokens);
}
