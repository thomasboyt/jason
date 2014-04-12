require('./traceur-runtime');
let m = require('mori');

import lex from './lex';
import { match } from './util';

import { tokens as t } from './constants';

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

let makeParseFn = (cb) => (stream, ...args) => {
  let cur = stream[0];
  let rest = stream.slice(1);
  return cb(cur, rest, ...args);
};

let assoc = (obj, key, val) => {
  let clone;
  if ( Array.isArray(obj) ) {
    // TODO: actually clone
    clone = obj;
  } else {
    clone = Object.assign({}, obj);
  }
  clone[key] = val;
  return clone;
};

let parseAfterValue = makeParseFn((cur, rest, acc) => matchToken(
  cur.type,
  [t.COMMA, () => parseKeyValue(rest, acc)],
  [t.RIGHT_BRACE, () => [acc, rest]]
));

let parseValue = makeParseFn((cur, rest, keyName, acc) => {
  
  let assocValue = (val) => [assoc(acc, keyName, val), rest];

  return matchToken(
    cur.type,
    [t.STRING, () => assocValue(cur.value)],
    [t.NUMBER, () => assocValue(toNumber(cur.value))],
    [t.TRUE, () => assocValue(true)],
    [t.FALSE, () => assocValue(false)],
    [t.NULL, () => assocValue(null)],
    [t.LEFT_BRACE, () => {
      let [obj, restP] = parseObject(rest);
      return [assoc(acc, keyName, obj), restP];
    }],
    [t.LEFT_BRACKET, () => {
      let [obj, restP] = parseArray(rest);
      return [assoc(acc, keyName, obj), restP];
    }]
  );
});

let parseSeparator = (cur, rest, cb) => matchToken(
  cur.type,
  [t.COLON, () => rest]
);

let parseKeyValue = makeParseFn((cur, rest, acc) => matchToken(
  cur.type,
  [t.STRING, () => {
    // TODO: less imperative?
    let keyName = cur.value;
    let restP = parseSeparator(...hat(rest));
    let [accP, restPP] = parseValue(restP, keyName, acc);
    return parseAfterValue(restPP, accP);
  }]
));

// http://www.json.org/object.gif
let parseObject = makeParseFn((cur, rest) => matchToken(
  cur.type,
  [t.STRING, () => parseKeyValue([cur, ...rest], {})],
  [t.RIGHT_BRACE, () => [{}, rest]]
));

let parseArrayEntry = (rest, acc) => {
  let [accP, [curP, ...restP]] = parseValue(rest, acc.length, acc);
  return matchToken(
    curP.type,
    [t.COMMA, () => parseArrayEntry(restP, accP)],
    [t.RIGHT_BRACKET, () => [accP, restP]]
  );
};

let parseArray = makeParseFn((cur, rest) => match(
  cur.type,
  () => parseArrayEntry([cur, ...rest], []),
  [t.RIGHT_BRACKET, () => [[], rest]]
));

let parseDocument = function(tokens) {
  let cur = tokens[0];
  let rest = tokens.slice(1);

  let [acc, rest] = matchToken(
    cur.type,
    [t.LEFT_BRACE, () => parseObject(rest)],
    [t.LEFT_BRACKET, () => parseArray(rest)]
  );

  if ( rest !== null && rest[0] !== null ) {
    throw Error('Unexpected ' + rest[0].type);
  }

  return acc;
};

export default function(input) {
  let tokens = lex(input);
  console.log(tokens);
  return parseDocument(tokens);
}
