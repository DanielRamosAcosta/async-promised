import { mapSeries as asyncMapSeries } from "async";

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @returns {Promise} a promise, if no callback is passed
 */
export default function map<T, R>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<R>
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    asyncMapSeries(
      arr,
      (item: T, cb) => {
        iterator(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? reject(err) : resolve(results))
    );
  });
}
