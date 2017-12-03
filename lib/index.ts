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

export {default as applyEach} from './applyEach';
export {default as applyEachSeries} from './applyEachSeries';
export {default as asyncify} from './asyncify';
export {default as auto} from './auto';
export {default as autoInject} from './autoInject';
export {default as detect} from './detect';
export {default as detectLimit} from './detectLimit';
export {default as detectSeries} from './detectSeries';
export {default as each} from './each';
export {default as eachLimit} from './eachLimit';
export {default as eachSeries} from './eachSeries';
export {default as filter} from './filter';
export {default as filterLimit} from './filterLimit';
export {default as filterSeries} from './filterSeries';
export {default as find} from './detect';
export {default as findLimit} from './detectLimit';
export {default as findSeries} from './detectSeries';
export {default as forEach} from './each';
export {default as forEachLimit} from './eachLimit';
export {default as forEachSeries} from './eachSeries';
export {default as reject} from './reject';
export {default as rejectLimit} from './rejectLimit';
export {default as rejectSeries} from './rejectSeries';
export {default as select} from './filter';
export {default as selectSeries} from './filterSeries';
export {default as setImmediate} from './setImmediate';
export {default as sortBy} from './sortBy';
export {default as waterfall} from './waterfall';
