import { everySeries as asyncEverySeries, IterableCollection } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
export default function mapValuesLimit<T>(
  coll: IterableCollection<T>,
  iteratee: (value: T) => Promise<boolean>
): Promise<T> {
  return new Promise((resolve, reject) => {
    asyncEverySeries(
      coll,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}
