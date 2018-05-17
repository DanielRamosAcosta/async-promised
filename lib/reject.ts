import { reject as asyncReject } from "async";

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`. The `iteratee` should complete with a boolean value as its `result`.
 * @example
 *
 * async
 *   .reject(["file1", "file2", "file3"], filePath =>
 *     fs.access(filePath).catch(err => false)
 *   )
 *   .then(results => {
 *     // results now equals an array of missing files
 *     createFiles(results);
 *   });
 */

export default function reject<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, promiseReject) => {
    asyncReject(
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
