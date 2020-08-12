# JSTON
JSTON (JavaScript Typed Object Notation) functions for essentially representing any type of object as JSON.

# Simple Examples
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

console.log(JSTON.parse("[{\"Number\":\"NaN\"},5]"));
// -> [NaN,5]
```

# Custom Type Example
```javascript
const JSTON = require('jston');

function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}
Person.prototype = {
  constructor: Person,
  toString: function() {
    return `Person(${this.firstName}, ${this.lastName})`;
  }
};

let john = new Person('John', 'Smith');
let jane = new Person('Jane', 'Smith');

let strJSTON = JSTON.stringify([john, jane], 2, function(value, typeName) {
  if (value instanceof Person) {
    return {
      "type": "Person",
      value: { firstName: value.firstName, lastName: value.lastName }
    };
  }
});
console.log(strJSTON);
// // Results in the following string representation:
// [
//   {
//     "Person": {
//       "firstName": "John",
//       "lastName": "Smith"
//     }
//   },
//   {
//     "Person": {
//       "firstName": "Jane",
//       "lastName": "Smith"
//     }
//   }
// ]

let arr = JSTON.parse(strJSTON, function(value, typeName) {
  if (typeName === 'Person') {
    return {
      value: new Person(value.firstName, value.lastName)
    };
  }
});
console.log(arr.join(' & '));
// -> "Person(John, Doe) & Person(Jane Doe)"
```

## Resources
https://www.npmjs.com/package/jston
