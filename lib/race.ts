import { race as asyncRace } from 'async';
import { callbackify, resolveCallback } from './internal/asyncTransforms';

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or throws
 * an error, the promise is resolved or rejected. It's equivalent to
 * `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @example
 *
 * async.race([
 *   async callback => {
 *     await sleep(200);
 *     return 'one';
 *   },
 *   async callback => {
 *     await sleep(100)
 *     return 'two';
 *   }
 * ])
 * .then(result => {
 *   // the result will be equal to 'two' as it finishes earlier
 * })
 */

export default function race<T>(tasks: ((...args: any[]) => Promise<T>)[]) {
  if (!Array.isArray(tasks)) {
    return Promise.reject(new TypeError('First argument to race must be an array of functions'))
  }
  return new Promise((resolve, reject) => {
    asyncRace(tasks.map(t => callbackify(t)), resolveCallback(resolve, reject))
  })
}
