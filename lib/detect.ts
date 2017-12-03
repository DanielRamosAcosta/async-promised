import { detect as asyncDetect } from 'async';

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.
 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * @example
 *
 * async
 *   .detect(['file1','file2','file3'], async filePath => {
 *     fs.access(filePath).catch(err => true)
 *   })
 *   .then(results => {
 *     // result now equals the first file in the list that exists
 *   });
 */

export default function detect<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<boolean>
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    asyncDetect(
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
