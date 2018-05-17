/**
 * Take a sync function and make it async, passing its return value to a
 * promise. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function. Errors thrown will be passed
 * down to the promise chain.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args...)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *   async.apply(fsp.readFile, filename, "utf8"),
 *   async.asyncify(JSON.parse),
 *   async function (data) {
 *     // data is the result of parsing the text.
 *   }
 * ]);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *   async.apply(fs.readFile, filename, "utf8"),
 *   async.asyncify(function (contents) {
 *     return db.model.create(contents);
 *   }),
 *   async function (model) {
 *     // `model` is the instantiated model object.
 *     // If there was an error, this function would be skipped.
 *   }
 * ]);
 *
 */

export default (func: Function) => (...args: any[]) =>
  Promise.resolve().then(() => func(...args));
