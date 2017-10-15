import { eachSeries as asyncEachSeries } from 'async';

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`. The array index is not passed to the iteratee. If you need the index,
 * use `eachOfSeries`.
 */

export default function eachSeries<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEachSeries(
      coll as any,
      (item: T, cb) => {
        iteratee(item)
          .then(() => cb())
          .catch(err => cb(err));
      },
      err => (err ? reject(err) : resolve())
    );
  });
}
