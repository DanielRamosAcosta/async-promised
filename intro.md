![Async Logo](https://raw.githubusercontent.com/caolan/async/master/logo/async-logo_readme.jpg)

[![Build Status via Travis CI](https://travis-ci.org/caolan/async.svg?branch=master)](https://travis-ci.org/caolan/async)
[![NPM version](https://img.shields.io/npm/v/async.svg)](https://www.npmjs.com/package/async)
[![Coverage Status](https://coveralls.io/repos/caolan/async/badge.svg?branch=master)](https://coveralls.io/r/caolan/async?branch=master)
[![Join the chat at https://gitter.im/caolan/async](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/caolan/async?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*For Async v1.5.x documentation, go [HERE](https://github.com/caolan/async/blob/v1.5.2/README.md)*

Async is a utility module which provides straight-forward, powerful functions
for working with asynchronous JavaScript. Although originally designed for
use with [Node.js](https://nodejs.org/) and installable via `npm install --save async-promised`,
it can also be used directly in the browser.

Async is also installable via:

- [yarn](https://yarnpkg.com/en/): `yarn add async-promised`
- [bower](http://bower.io/): `bower install async-promised`

Async provides around 70 functions that include the usual 'functional'
suspects (`map`, `reduce`, `filter`, `each`…) as well as some common patterns
for asynchronous control flow (`parallel`, `series`, `waterfall`…). All these
functions assume you follow the Node.js convention of providing a single
callback as the last argument of your asynchronous function -- a callback which expects an Error as its first argument -- and calling the callback once.


## Quick Examples

```js
async.map(['file1','file2','file3'], fsp.stat)
.then(results => {
    // results is now an array of stats for each file  
})

async.filter(["file1", "file2", "file3"], filePath =>
    fsp.access(filePath).catch(err => true)
)
.then(results => {
    // results now equals an array of the existing files
});

async.parallel([
    async function() { ... },
    async function() { ... }
])
.then(results => {
// optional callback
})

async.series([
    async function() { ... },
    async function() { ... }
]);
```

There are many more functions available so take a look at the docs below for a
full list. This module aims to be comprehensive, so if you feel anything is
missing please create a GitHub issue for it.

## Common Pitfalls [(StackOverflow)](http://stackoverflow.com/questions/tagged/async.js)

### Synchronous iteration functions

If you get an error like `RangeError: Maximum call stack size exceeded.` or other stack overflow issues when using async, you are likely using a synchronous iteratee.  By *synchronous* we mean a function that calls its callback on the same tick in the javascript event loop, without doing any I/O or using any timers.  Calling many callbacks iteratively will quickly overflow the stack. If you run into this issue, just defer your callback with `async.setImmediate` to start a new call stack on the next tick of the event loop.

This can also arise by accident if you callback early in certain cases:

```js
async.eachSeries(hugeArray, async item => {
    if (inCache(item)) {
        return cache[item] // if many items are cached, you'll overflow
    } else {
        return await doSomeIO(item);
    }
})
.then(() => {
    //...
});
```

Just change it to:

```js
async.eachSeries(hugeArray, async item => {
    if (inCache(item)) {
        await async.setImmediate(() => {
            return cache[item]
        });
    } else {
        return await doSomeIO(item);
    }
})
.then(() => {
    //...
});
```

Async does not guard against synchronous iteratees for performance reasons. If you are still running into stack overflows, you can defer as suggested above, or wrap functions with [`async.ensureAsync`](#ensureAsync) Functions that are asynchronous by their nature do not have this problem and don't need the extra callback deferral.

If JavaScript's event loop is still a bit nebulous, check out [this article](http://blog.carbonfive.com/2013/10/27/the-javascript-event-loop-explained/) or [this talk](http://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html) for more detailed information about how it works.


<!--

With async functions/promises this is necesary?

### Multiple callbacks

Make sure to always `return` when calling a callback early, otherwise you will cause multiple callbacks and unpredictable behavior in many cases.

```js
async.waterfall([
    function(callback) {
        getSomething(options, function (err, result) {
            if (err) {
                callback(new Error("failed getting something:" + err.message));
                // we should return here
            }
            // since we did not return, this callback still will be called and
            // `processData` will be called twice
            callback(null, result);
        });
    },
    processData
], done)
```

It is always good practice to `return callback(err, result)`  whenever a callback call is not the last statement of a function.

-->


### Binding a context to an iteratee

This section is really about `bind`, not about `async`. If you are wondering how to
make `async` execute your iteratees in a given context, or are confused as to why
a method of another library isn't working as an iteratee, study this example:

```js
// Here is a simple object with an (unnecessarily roundabout) squaring method
var AsyncSquaringLibrary = {
    squareExponent: 2,
    square: async number => {
        const result = Math.pow(number, this.squareExponent);
        await sleep(200);
        return result;
    }
};

async.map([1, 2, 3], AsyncSquaringLibrary.square).then(result => {
    // result is [NaN, NaN, NaN]
    // This fails because the `this.squareExponent` expression in the square
    // function is not evaluated in the context of AsyncSquaringLibrary, and is
    // therefore undefined.
});

async.map([1, 2, 3], AsyncSquaringLibrary.square.bind(AsyncSquaringLibrary)).then(result => {
    // result is [1, 4, 9]
    // With the help of bind we can attach a context to the iteratee before
    // passing it to async. Now the square function will be executed in its
    // 'home' AsyncSquaringLibrary context and the value of `this.squareExponent`
    // will be as expected.
});
```

## Download

The source is available for download from
[GitHub](https://raw.githubusercontent.com/caolan/async/master/dist/async.min.js).
Alternatively, you can install using npm:

```bash
$ npm install --save async-promised
```

As well as using Bower:

```bash
$ bower install async-promised
```

You can then `require()` async as normal:

```js
const async = require("async-promised");
```

Or require individual methods:

```js
const waterfall = require("async-promised/waterfall");
const map = require("async-promised/map");
```

<!-- TODO: Rewrite this -->

__Development:__ [async.js](https://raw.githubusercontent.com/caolan/async/master/dist/async.js) - 29.6kb Uncompressed

### In the Browser

Async should work in any ES5 environment (IE9 and above).

Usage:

```html
<script type="text/javascript" src="async.js"></script>
<script type="text/javascript">

    async.map(data, asyncProcess, function(err, results) {
        alert(results);
    });

</script>
```

The portable versions of async, including `async.js` and `async.min.js`, are
included in the `/dist` folder. Async can also be found on the [jsDelivr CDN](http://www.jsdelivr.com/projects/async).

### ES Modules

We also provide async as a collection of ES2015 modules, in an alternative `async-es` package on npm.

```bash
$ npm install --save async-promised-es
```

```js
import waterfall from 'async-promised-es/waterfall';
import { waterfall } from 'async-promised-es';
import * as async from 'async-promised-es';
```

## Other Libraries

* [`limiter`](https://www.npmjs.com/package/limiter) a package for rate-limiting based on requests per sec/hour.
* [`neo-async`](https://www.npmjs.com/package/neo-async) an altername implementation of Async, focusing on speed.
* [`co-async`](https://www.npmjs.com/package/co-async) a library inspired by Async for use with [`co`](https://www.npmjs.com/package/co) and generator functions.
*  [`promise-async`](https://www.npmjs.com/package/promise-async) a version of Async where all the methods are Promisified.
