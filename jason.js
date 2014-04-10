// some tokens!
var LEFT_BRACE = '{';
var RIGHT_BRACE = '}';
var LEFT_BRACKET = '[';
var RIGHT_BRACKET = ']';
var COLON = ':';
var COMMA = ',';
var QUOTE = '"';

var ltrim = function(str) {
  return str.replace(/^\s+/, '');
};

var Token = function(type, value) {
  this.type = type;
  this.value = value;
};


// Lexing
// =================

var lexString = function(input, acc) {
  // TODO: a bunch of weird control chars
  if ( !acc ) { acc = ''; }
  var char = input[0];

  switch(char) {
    case undefined:
      throw new Error('No matching quote found for string');
    case QUOTE:
      return { sym: new Token('string', acc), rest: input.slice(1) };
    default:
      return lexString(input.slice(1), acc + char);
  }
};

var lex = function(input) {
  // return an array of tokens
  input = ltrim(input);
  var char = input[0];

  // poor man's pattern matching
  var sym;
  var rest;
  switch(char) {
    // TODO: less copy-paste here, derp
    case undefined:
      return null;
    case LEFT_BRACE:
      sym = new Token(LEFT_BRACE);
      break;
    case RIGHT_BRACE:
      sym = new Token(RIGHT_BRACE);
      break;
    case LEFT_BRACKET:
      sym = new Token(LEFT_BRACE);
      break;
    case RIGHT_BRACKET:
      sym = new Token(RIGHT_BRACKET);
      break;
    case COMMA:
      sym = new Token(COMMA);
      break;
    case COLON:
      sym = new Token(COLON);
      break;

    // interesting ones
    case QUOTE:
      var res = lexString(input.slice(1));
      sym = res.sym;
      rest = res.rest;
      break;

    // TODO: digit, literals (true, false, null)

    default:
      throw new Error('Could not parse character: ' + char);
  }
  if ( !rest ) { rest = input.slice(1); }
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
