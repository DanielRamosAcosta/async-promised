import { setImmediate as asyncSetImmediate } from 'async';

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `setImmediate`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name setImmediate
 * @static
 * @memberOf module:Utils
 * @method
 * @alias nextTick
 * @category Util
 * @param {...*} args... - any number of additional arguments to pass to the
 * resovled promise as an array
 * @example
 *
 * var callOrder = [];
 * async.setImmediate().then(() => {
 *   callOrder.push('two');
 *   // call_order now equals ['one','two']
 * });
 * callOrder.push('one');
 *
 * async.setImmediate(1, 2, 3).then(([a, b, c]) => {
 *   // a, b, and c equal 1, 2, and 3
 * });
 */

export default function setImmediate<T>(...args: T[]): Promise<T[]> {
  return new Promise(resolve => {
    asyncSetImmediate(resolve, args);
  });
}
