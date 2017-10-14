import * as async from 'async';

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
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
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

function reject<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, promiseReject) => {
    async.reject(
      arr as any,
      (item: T, cb) => {
        iterator(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? promiseReject(err) : resolve(results))
    );
  });
}

export = reject;
