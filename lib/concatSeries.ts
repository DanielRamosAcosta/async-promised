import { concatSeries as asyncConcatSeries } from 'async';
import { callbackify, resolveCallback } from './internal/asyncTransforms';

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
export default function concat<T>(
  coll: T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    asyncConcatSeries(coll, callbackify(iteratee), resolveCallback(resolve, reject));
  });
}
