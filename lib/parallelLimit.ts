import { parallelLimit as asyncParallelLimit } from "async";
import { callbackifyFuncs } from "./internal/asyncTransforms";

type ArrayOfAsyncFuncs<T> = Array<() => Promise<T>>;
type DictOfAsyncFuncs<T> = async.Dictionary<() => Promise<T>>;

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 * @returns {Promise} a promise, if a callback is not passed
 */
export function parallelLimit<T>(
  tasks: ArrayOfAsyncFuncs<T>,
  limit: number
): Promise<T[]>;
export function parallelLimit<T>(
  tasks: DictOfAsyncFuncs<T>,
  limit: number
): Promise<{ [key: string]: T }>;
export default function parallelLimit<T>(
  tasks: ArrayOfAsyncFuncs<T> | DictOfAsyncFuncs<T>,
  limit: number
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    asyncParallelLimit(callbackifyFuncs(tasks), limit, (err, results) => {
      err ? reject(err) : resolve(results);
    });
  });
}
