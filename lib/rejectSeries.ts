import { rejectSeries as asyncRejectSeries } from 'async';

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`. The `iteratee` should complete with a boolean value as its `result`.
 */

export default function reject<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, promiseReject) => {
    asyncRejectSeries(
      coll as any,
      (item: T, cb) => {
        iteratee(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? promiseReject(err) : resolve(results))
    );
  });
}
