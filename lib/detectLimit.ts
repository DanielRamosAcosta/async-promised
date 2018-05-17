import { detectLimit as asyncDetectLimit } from "async";

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of
 * `limit` async operations at a time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 */

export default function detectLimit<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<boolean>
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    asyncDetectLimit(
      arr as any,
      limit,
      (item: T, cb) => {
        iteratee(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? reject(err) : resolve(results))
    );
  });
}
