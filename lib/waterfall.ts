import { waterfall as asyncWaterfall } from 'async';
import { AsyncResultPromise, callbackifyFuncs } from './internal/asyncTransforms';

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *   async () => {
 *     return ['one', 'two']);
 *   },
 *   async ([arg1, arg2]) => {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     return 'three';
 *   },
 *   async arg1 => {
 *     // arg1 now equals 'three'
 *     return 'done';
 *   }
 * ])
 * .then(result => {
 *   // result now equals 'done'
 * })
 *
 * // Or, with named functions:
 * async.waterfall([
 *   myFirstFunction,
 *   mySecondFunction,
 *   myLastFunction,
 * ]).then(function (result) {
 *   // result now equals 'done'
 * });
 * async function myFirstFunction() {
 *   return ['one', 'two'];
 * }
 * async function mySecondFunction(arg1, arg2, callback) {
 *   // arg1 now equals 'one' and arg2 now equals 'two'
 *   return 'three';
 * }
 * async function myLastFunction(arg1, callback) {
 *   // arg1 now equals 'three'
 *   return 'done';
 * }
 */

export default function waterfall(
  tasks: AsyncResultPromise[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncWaterfall(
      callbackifyFuncs(tasks),
      err => (err ? reject(err) : resolve())
    );
  });
}
