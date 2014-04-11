require('./traceur-runtime');
let m = require('mori');

import lex from './lex';
import { match } from './util';

import {
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  COLON,
  COMMA,
  QUOTE
} from './lex';

// split arr into Head And Tail (hat)
let hat = (arr) => [arr[0], arr.slice(1)];

let matchToken = (value, ...patterns) => match(
  value,
  () => { throw new Error('Unexpected ' + value); },
  ...patterns
);

let toNumber = (val) => {
  let n = 0;

  let negativeMult = val.negative ? -1 : 1;
  let base;
  if ( val.frac !== undefined ) {
    let strN = val.int + '.' + val.frac;
    base = parseFloat(strN);
  } else {
    base = parseInt(val.int, 10);
  }

  let expNegativeMult = val.expNegative ? -1 : 1;
  let e = val.exp === undefined ? 1 :  Math.pow(10, (expNegativeMult * parseInt(val.exp)));

  return negativeMult * base * e;
};

// Parsing
// =================

function makeParseFn(cb) {
  return function(stream, ...args) {
    let cur = stream[0];
    let rest = stream.slice(1);
    return cb(cur, rest, ...args);
  };
}

let assoc = (obj, key, val) => {
  let clone = Object.assign({}, obj);
  clone[key] = val;
  return clone;
};

let parseAfterValue = makeParseFn((cur, rest, acc) => matchToken(
  cur.type,
  [COMMA, () => parseKeyValue(rest, acc)],
  [RIGHT_BRACE, () => [acc, rest]]
));

let parseValue = makeParseFn((cur, rest, keyName, acc) => {
  let [accP, restP] = matchToken(
    cur.type,
    ['string', () => [assoc(acc, keyName, cur.value), rest]],
    ['number', () => [assoc(acc, keyName, toNumber(cur.value)), rest]],
    ['true', () => [assoc(acc, keyName, true), rest]],
    ['false', () => [assoc(acc, keyName, false), rest]],
    ['null', () => [assoc(acc, keyName, null), rest]],
    [LEFT_BRACE, () => {
      let [obj, restP] = parseObject(rest);
      return [assoc(acc, keyName, obj), restP];
    }]
  );

  return parseAfterValue(restP, accP);
});

let parseSeparator = (cur, rest, cb) => matchToken(
  cur.type,
  [COLON, () => cb(rest)]
);

let parseKeyValue = makeParseFn((cur, rest, acc) => matchToken(
  cur.type,
  ['string', () => {
    let keyName = cur.value;
    let [curP, restP] = hat(rest);
    return parseSeparator(curP, restP, (rest) => parseValue(rest, keyName, acc));
  }]
));

// http://www.json.org/object.gif
let parseObject = makeParseFn((cur, rest) => match(
  cur.type,
  () => { throw new Error('Unexpected ' + cur.type); },
  ['string', () => parseKeyValue([cur, ...rest], {})],
  [RIGHT_BRACE, () => [{}, rest]]
));

let parseDocument = function(tokens) {
  let cur = tokens[0];
  let rest = tokens.slice(1);

  let [acc, rest] = match(
    cur.type,
    () => { throw new Error('Unexpected ' + cur.type); },
    [LEFT_BRACE, () => parseObject(rest)],
    [LEFT_BRACKET, () => parseArray(rest, [])]
  );

  if ( rest !== null && rest[0] !== null ) {
    throw Error('Unexpected ' + rest[0].type);
  }

  return acc;
};

export default function(input) {
  let tokens = lex(input);
  return parseDocument(tokens);
}
