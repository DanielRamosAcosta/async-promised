import { IterableCollection, someSeries as asyncSomeSeries } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
export default function mapValuesLimit<T>(
  coll: IterableCollection<T>,
  iteratee: (value: T) => Promise<boolean>
): Promise<T> {
  return new Promise((resolve, reject) => {
    asyncSomeSeries(
      coll,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}
