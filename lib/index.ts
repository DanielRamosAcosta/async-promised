/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async-promised`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */

/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

export { default as all } from "./every";
export { default as allLimit } from "./everyLimit";
export { default as allSeries } from "./everySeries";
export { default as any } from "./some";
export { default as anyLimit } from "./someLimit";
export { default as anySeries } from "./someSeries";
export { default as apply } from "./apply";
export { default as applyEach } from "./applyEach";
export { default as applyEachSeries } from "./applyEachSeries";
export { default as asyncify } from "./asyncify";
export { default as auto } from "./auto";
export { default as autoInject } from "./autoInject";
export { default as compose } from "./compose";
export { default as concat } from "./concat";
export { default as concatLimit } from "./concatLimit";
export { default as concatSeries } from "./concatSeries";
export { default as constant } from "./constant";
export { default as detect } from "./detect";
export { default as detectLimit } from "./detectLimit";
export { default as detectSeries } from "./detectSeries";
export { default as dir } from "./dir";
export { default as doDuring } from "./doDuring";
export { default as doUntil } from "./doUntil";
export { default as doWhilst } from "./doWhilst";
export { default as during } from "./during";
export { default as each } from "./each";
export { default as eachLimit } from "./eachLimit";
export { default as eachOf } from "./eachOf";
export { default as eachOfLimit } from "./eachOfLimit";
export { default as eachOfSeries } from "./eachOfSeries";
export { default as eachSeries } from "./eachSeries";
export { default as ensureAsync } from "./ensureAsync";
export { default as every } from "./every";
export { default as everyLimit } from "./everyLimit";
export { default as everySeries } from "./everySeries";
export { default as filter } from "./filter";
export { default as filterLimit } from "./filterLimit";
export { default as filterSeries } from "./filterSeries";
export { default as find } from "./detect";
export { default as findLimit } from "./detectLimit";
export { default as findSeries } from "./detectSeries";
export { default as foldl } from "./reduce";
export { default as foldr } from "./reduceRight";
export { default as forEach } from "./each";
export { default as forEachLimit } from "./eachLimit";
export { default as forEachOf } from "./eachOf";
export { default as forEachOfLimit } from "./eachOfLimit";
export { default as forEachOfSeries } from "./eachOfSeries";
export { default as forEachSeries } from "./eachSeries";
export { default as forever } from "./forever";
export { default as groupBy } from "./groupBy";
export { default as groupByLimit } from "./groupByLimit";
export { default as groupBySeries } from "./groupBySeries";
export { default as inject } from "./reduce";
export { default as log } from "./log";
export { default as map } from "./map";
export { default as mapLimit } from "./mapLimit";
export { default as mapSeries } from "./mapSeries";
export { default as mapValues } from "./mapValues";
export { default as mapValuesLimit } from "./mapValuesLimit";
export { default as mapValuesSeries } from "./mapValuesSeries";
export { default as memoize } from "./memoize";
export { default as nextTick } from "./nextTick";
export { default as parallel } from "./parallel";
export { default as parallelLimit } from "./parallelLimit";
export { default as race } from "./race";
export { default as reduce } from "./reduce";
export { default as reduceRight } from "./reduceRight";
export { default as reflect } from "./reflect";
export { default as reflectAll } from "./reflectAll";
export { default as reject } from "./reject";
export { default as rejectLimit } from "./rejectLimit";
export { default as rejectSeries } from "./rejectSeries";
export { default as retry } from "./retry";
export { default as retryable } from "./retryable";
export { default as select } from "./filter";
export { default as selectSeries } from "./filterSeries";
export { default as seq } from "./seq";
export { default as series } from "./series";
export { default as setImmediate } from "./setImmediate";
export { default as some } from "./some";
export { default as someLimit } from "./someLimit";
export { default as someSeries } from "./someSeries";
export { default as sortBy } from "./sortBy";
export { default as timeout } from "./timeout";
export { default as times } from "./times";
export { default as timesLimit } from "./timesLimit";
export { default as timesSeries } from "./timesSeries";
export { default as tryEach } from "./tryEach";
export { default as unmemoize } from "./unmemoize";
export { default as until } from "./until";
export { default as waterfall } from "./waterfall";
export { default as whilst } from "./whilst";
