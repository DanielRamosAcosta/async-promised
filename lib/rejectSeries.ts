import * as async from 'async';

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
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */

function reject<T>(
  arr: async.Dictionary<T> | T[] | IterableIterator<T>,
  iterator: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, promiseReject) => {
    async.rejectSeries(
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
