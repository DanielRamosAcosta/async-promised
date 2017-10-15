import { filterLimit as asyncFilterLimit } from 'async';

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of
 * `limit` async operations at a time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 */

export default function filterLimit<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, reject) => {
    asyncFilterLimit(
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
