/* jshint esnext: true, node: true, undef: false */

require('./traceur-runtime');

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

var ltrim = function(str) {
  return str.replace(/^\s+/, '');
};

var Token = function(type, value) {
  this.type = type;
  this.value = value;
};

var match = function(value, noMatchCondition, ...patterns) {
  for ( let [pattern, callback] of patterns ) {

    if ( typeof pattern !== 'object' || pattern === null ) {
      if ( value === pattern ) {
        return callback(value);
      }
    } else if ( pattern instanceof RegExp ) {
      if ( pattern.test(value) === true ) {
        return callback(value);
      }
    } else {
      throw new Error('Couldn\'t parse pattern');
    }

  }
  return noMatchCondition(value);
};


// Lexing
// =================

var lexString = function(input, acc) {
  // TODO: a bunch of weird control chars
  if ( !acc ) { acc = ''; }
  let char = input[0];
  let rest = input.slice(1);

  return match(
    char,
    () => lexString(rest, acc + char),
    [QUOTE, () => [new Token('string', acc), rest]],
    [undefined, () => { throw new Error('No matching quote found for string'); }]
  );
};

var lexAlpha = function(input, acc) {
  // TODO: a bunch of weird control chars
  if ( !acc ) { acc = ''; }
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

var lexCharacter = function(input) {
  return [ new Token(input[0]), input.slice(1) ];
};

var lex = function(input) {
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
    [/[a-z]/, () => lexAlpha(input)]
    // TODO: numbers, true/false/null
  );

  if ( rest === null ) {
    return [sym];
  }

  return [sym].concat(lex(rest));
};


// Parsing
// =================

var parseObject = function(tokens, acc) {
  if ( !acc ) acc = {};
  var nextToken = tokens[0];

  if ( nextToken.type === RIGHT_BRACE ) {
    return acc;
  }

  var key = parseString(tokens);
};

var parseTop = function(tokens) {
  var nextToken = tokens[0];

  switch(nextToken.type) {
    case LEFT_BRACE:
      var res = parseObject(tokens.slice(1));
      break;
  }
};

var jason = function(input) {

  var tokens = lex(input);
  console.log(tokens);
  //return parseTop(tokens);

//   var currentToken = input[0];
//   var currentTokenIdx = 0;
//   var nextToken = function() {
//     currentTokenIdx++;
//   };
//
//   var parseKeyValue = function(input) {
//     input = ltrim(str);
//
//     if ( c === RIGHT_BRACE ) {
//       // end of object
//       return null;
//     }
//     if ( c !== QUOTE ) {
//       throw new Error('Couldn\'t parse key');
//     }
//   };
//
//   var parseObject = function(input, obj) {
//     obj = obj || {};
//
//     input = ltrim(str);
//
//     var end = false;
//     while (!end) {
//       var key = parseNextKey();
//     }
//     // parse key
//     // parse value
//     // keep tryin'
//   };
//
//   nextToken();
//
//   throw new Error('Couldn\'t parse :(');
};

process.stdin.setEncoding('utf8');

var input = '';

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  console.log(jason(input));
});
