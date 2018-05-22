# async-promised

[![Build Status](https://img.shields.io/travis/DanielRamosAcosta/async-promised.svg)](https://travis-ci.org/DanielRamosAcosta/async-promised)

Native promise wrapper around [`caolan/async`](https://github.com/caolan/async)

It needs an ES6 environment to work (Promises, Block-scoped binding constructs, etc) like modern browsers and node 4.

Example:

```javascript
const async = require('async-promised');
const sleep = require('sleep-promise');

await async.each([1, 3, 2], async x => {
  const ms = x * 25
  await sleep(ms)
  console.log(`I'm at element ${x}, and I waited ${ms}`)
});
```

## Limitations

* A promise can't be resolved with multiple values
* A promise can't be rejected with an Error and in the catch scope access the
  current results.
