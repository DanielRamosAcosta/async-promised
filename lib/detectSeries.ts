import { detectSeries as asyncDetectSeries } from "async";

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a
 * single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 */

export default function detectSeries<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<boolean>
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    asyncDetectSeries(
      arr as any,
      (item: T, cb) => {
        iterator(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? reject(err) : resolve(results))
    );
  });
}
