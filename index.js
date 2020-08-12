module.exports = {
  parse: fromJSTON,
  stringify: toJSTON
};

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

  let typeName = getType(value);
  
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
    let items = [];
    for (let i = 0, l = value.length; i < l; i++) {
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
    let result = interpret(value, typeName);
    if (result != null && "type" in result && "value" in result) {
      let returnValue = {};
      let recurseValue = recurseTo(result.value, seenValues, interpret);
      if ('Object' === getType(recurseValue)) {
        recurseValue = recurseValue[Object.keys(recurseValue)[0]];
      }
      returnValue[result.type] = recurseValue;
      return returnValue;
    }
  }
  
  if (typeName === 'Object') {
    let result = {};
    for (let keys = Object.keys(value), i = 0, l = keys.length; i < l; i++) {
      let key = keys[i];
      result[key] = recurseTo(value[key], seenValues, interpret);
    }
    return { Object: result };
  }
  
  throw new Error('Cannot convert ' + typeName + ' to TON.');
}

// Used by fromJSTON to recursively parse the specified value.
function recurseFrom(value, parse) {
  let typeName = getType(value);

  // If this is an object of some sort figure out what type of value it should
  // be parsed as.
  if (typeName === 'Object') {
    // Find the keys to this header object making sure that it has exactly one
    // key/value pair.
    let keys = Object.keys(value);
    if (keys.length === 0) {
      throw new Error('Invalid object header contains no keys when just one should be present.');
    }
    if (keys.length !== 1) {
      throw new Error('Invalid object header contains multiple keys when only one should be present:\n- ' + keys.join('\n- '));
    }

    // Only keep the one key and the one value corresponding to that key.
    let key = keys[0];
    let keyValue = value[key];

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
      let result = parse(keyValue, key);
      if (result && "value" in result) {
        return result.value;
      }
    }

    // If this is not a normal object then throw an error.
    if (key !== 'Object') {
      throw new Error('Unrecognized object type to parse:  ' + key);
    }
    
    // Parse the object as a normal object.
    let result = {};
    keyValue = Object(keyValue);
    keys = Object.keys(keyValue);
    for (let i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      result[key] = recurseFrom(keyValue[key], parse);
    }
    return result;
  }

  // If this is an array recursively parse its items.
  if (typeName === 'Array') {
    let items = [];
    for (let i = 0, l = value.length; i < l; i++) {
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