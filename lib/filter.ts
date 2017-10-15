import { filter as asyncFilter } from 'async';

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * @example
 *
 * async
 *   .filter(["file1", "file2", "file3"], filePath =>
 *     fs.access(filePath).catch(err => true)
 *   )
 *   .then(results => {
 *     // results now equals an array of the existing files
 *   });
 */

export default function filter<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, reject) => {
    asyncFilter(
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
