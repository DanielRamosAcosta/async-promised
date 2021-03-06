import { timesLimit as asyncTimesLimit } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */

export default function times<R>(
  count: number,
  limit: number,
  iteratee: (n: number) => Promise<R>
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    asyncTimesLimit(
      count,
      limit,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}
