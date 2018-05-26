import { IterableCollection, someLimit as asyncSomeLimit } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
export default function mapValuesLimit<T>(
  coll: IterableCollection<T>,
  limit: number,
  iteratee: (value: T) => Promise<boolean>
): Promise<T> {
  return new Promise((resolve, reject) => {
    asyncSomeLimit(
      coll,
      limit,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}
