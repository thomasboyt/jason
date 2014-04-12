export let ltrim = function(str) {
  return str.replace(/^\s+/, '');
};

// split arr into Head And Tail (hat)
export let hat = (arr) => [arr[0], arr.slice(1)];

// return a copy of obj with key: val added
export let assoc = (obj, key, val) => {
  let clone;
  if ( Array.isArray(obj) ) {
    // TODO: actually clone
    clone = obj;
  } else {
    // TODO: this doesn't actually do a deep clone, just surface :(
    clone = Object.assign({}, obj);
  }
  clone[key] = val;
  return clone;
};

/**
 * Poor man's pattern matching.
 * 
 * @param value - The value to match against your patterns
 * @param noMatchCondition - A callback that gets called if none of your patterns are matched
 *     against.
 * @param patterns - >=1 tuple of [pattern, callback]
 *
 * Valid pattern types:
 *   * Primitives (string, number, bool, null, undefined) are strict equal'd against the value
 *   * Regexes are tested against the value
 *
 * Further ideas:
 *   * Generic callback `(value) => { return [true|false]; }`
 *   * Given a class, is it an instance of the class?
 */
export let match = function(value, noMatchCondition, ...patterns) {
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
