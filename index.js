/**
 * @preserve JSTON - JavaScript Typed Object Notation Parser & Interpreter
 * Home Page - https://www.npmjs.com/package/jston
 *
 * Copyright (c) 2020 Christopher West
 * Licensed under the MIT license.
 */
(function() {
  function toJSTON(value, space, interpret) {
    return JSON.stringify(recurseTo(value, [], interpret), null, space);
  };
  
  function fromJSTON(jston, parse) {
    return recurseFrom(JSON.parse(jston), parse);
  };
  
  // Used by toJSTON to recursively turn a value into a typed object.
  function recurseTo(value, seenValues, interpret) {
    if (seenValues.indexOf(value) >= 0) {
      throw new Error('Recursive structure cannot be represented as TON.');
    }
    seenValues = seenValues.concat([value]);
  
    var typeName = getType(value);
    
    if ('Number' === typeName) {
      return 'NaN-Infinity'.indexOf(value + '') >= 0
        ? { Number: value + '' }
        : (!value && 1 / value < 0)
          ? { Number: '-0' }
          : value;
    }
  
    if ('Boolean Null String Undefined'.indexOf(typeName) >= 0) {
      return value;
    }
  
    if ('Array Arguments'.indexOf(typeName) >= 0) {
      var items = [];
      for (var i = 0, l = value.length; i < l; i++) {
        items.push(recurseTo(value[i], seenValues, interpret));
      }
      return items;
    }
  
    if (typeName === 'RegExp') {
      return { RegExp: value + '' };
    }
  
    if (typeName === 'Date') {
      return { Date: value };
    }
    
    if (interpret) {
      var result = interpret(value, typeName);
      if (result != null && "type" in result && "value" in result) {
        var returnValue = {};
        var recurseValue = recurseTo(result.value, seenValues, interpret);
        if ('Object' === getType(recurseValue)) {
          recurseValue = recurseValue[Object.keys(recurseValue)[0]];
        }
        returnValue[result.type] = recurseValue;
        return returnValue;
      }
    }
    
    if (typeName === 'Object') {
      var result = {};
      for (var keys = Object.keys(value), i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        result[key] = recurseTo(value[key], seenValues, interpret);
      }
      return { Object: result };
    }
    
    throw new Error('Cannot convert ' + typeName + ' to TON.');
  }
  
  // Used by fromJSTON to recursively parse the specified value.
  function recurseFrom(value, parse) {
    var typeName = getType(value);
  
    // If this is an object of some sort figure out what type of value it should
    // be parsed as.
    if (typeName === 'Object') {
      // Find the keys to this header object making sure that it has exactly one
      // key/value pair.
      var keys = Object.keys(value);
      if (keys.length === 0) {
        throw new Error('Invalid object header contains no keys when just one should be present.');
      }
      if (keys.length !== 1) {
        throw new Error('Invalid object header contains multiple keys when only one should be present:\n- ' + keys.join('\n- '));
      }
  
      // Only keep the one key and the one value corresponding to that key.
      var key = keys[0];
      var keyValue = value[key];
  
      // If this is a date parse it as such.
      if (key === 'Date') {
        return new Date(keyValue);
      }
  
      // If this is a RegExp parse it as such.
      if (key === 'RegExp') {
        return new RegExp(keyValue);
      }
      
      // If this is a special number parse it as such.
      if (key === 'Number') {
        return +keyValue;
      }
  
      // If a special parsing function is given try using it to parse the
      // object.
      if (parse) {
        var result = parse(keyValue, key);
        if (result && "value" in result) {
          return result.value;
        }
      }
  
      // If this is not a normal object then throw an error.
      if (key !== 'Object') {
        throw new Error('Unrecognized object type to parse:  ' + key);
      }
      
      // Parse the object as a normal object.
      var result = {};
      keyValue = Object(keyValue);
      keys = Object.keys(keyValue);
      for (var i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        result[key] = recurseFrom(keyValue[key], parse);
      }
      return result;
    }
  
    // If this is an array recursively parse its items.
    if (typeName === 'Array') {
      var items = [];
      for (var i = 0, l = value.length; i < l; i++) {
        items[i] = recurseFrom(value[i], parse);
      }
      return items;
    }
  
    // In all other cases simply return the value.
    return value;
  }
  
  // Helper function used to get the type of any value.
  function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }

  // Create the actual JSTON object.
  var JSTON = { parse: fromJSTON, stringify: toJSTON };

  // https://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
  // If in Node...
  if ('undefined' !== typeof module && 'undefined' !== typeof module.exports) {
    module.exports = JSTON;
  }
  // If in browser...
  else {
    window.JSTON = JSTON;
  }
})();
