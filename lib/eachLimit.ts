import { eachLimit as asyncEachLimit } from 'async';

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`. The array index is not passed to the iteratee. If you need the index,
 * use `eachOfLimit`.
 */

export default function eachLimit<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEachLimit(
      arr as any,
      limit,
      (item: T, cb) => {
        iteratee(item)
          .then(res => cb())
          .catch(err => cb(err));
      },
      err => (err ? reject(err) : resolve())
    );
  });
}
