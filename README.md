# JSTON
JSTON (JavaScript Typed Object Notation) functions for essentially representing any type of object as JSON.

# Example
```javascript
const JSTON = require('jston');

console.log(JSTON.stringify(NaN));
// -> "{\"Number\":\"NaN\"}"

console.log(JSTON.stringify(Infinity));
// -> "{\"Number\":\"Infinity\"}"

console.log(JSTON.stringify(-0));
// -> "{\"Number\":\"-0\"}"

console.log(JSTON.stringify(NaN));
// -> "{\"Number\":\"NaN\"}"

console.log(JSON.parse("[{\"Number\":\"NaN\"},5]"));
// -> [NaN,5]
```

## Resources
https://www.npmjs.com/package/jston
